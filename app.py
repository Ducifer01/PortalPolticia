import os
from flask import Flask, render_template, redirect, url_for, request, flash
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "uma_chave_secreta_padrao_muito_segura")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///site.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    references = db.Column(db.Text, nullable=True) # Armazenar como JSON ou texto formatado

    def __repr__(self):
        return f"Post(\'{self.title}\', \'{self.content[:20]}...\')"

@app.route("/")
def index():
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template("index.html", posts=posts)

@app.route("/admin")
def admin_dashboard():
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template("admin/dashboard.html", posts=posts)

@app.route("/admin/new_post", methods=["GET", "POST"])
def new_post():
    if request.method == "POST":
        title = request.form["title"]
        content = request.form["content"]
        references = request.form["references"]
        
        if not title or not content:
            flash("Título e conteúdo são obrigatórios!", "danger")
        else:
            post = Post(title=title, content=content, references=references)
            db.session.add(post)
            db.session.commit()
            flash("Post criado com sucesso!", "success")
            return redirect(url_for("admin_dashboard"))
    return render_template("admin/new_post.html")

@app.route("/admin/edit_post/<int:post_id>", methods=["GET", "POST"])
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if request.method == "POST":
        post.title = request.form["title"]
        post.content = request.form["content"]
        post.references = request.form["references"]
        db.session.commit()
        flash("Post atualizado com sucesso!", "success")
        return redirect(url_for("admin_dashboard"))
    return render_template("admin/edit_post.html", post=post)

@app.route("/admin/delete_post/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    flash("Post deletado com sucesso!", "success")
    return redirect(url_for("admin_dashboard"))

@app.route("/post/<int:post_id>")
def post_detail(post_id):
    post = Post.query.get_or_404(post_id)
    return render_template("post_detail.html", post=post)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)


@app.before_request
def check_env_file():
    if not os.path.exists(".env"):
        if request.endpoint != "initial_setup" and request.endpoint != "static":
            return redirect(url_for("initial_setup"))

@app.route("/initial_setup", methods=["GET", "POST"])
def initial_setup():
    if os.path.exists(".env"):
        return redirect(url_for("index"))

    if request.method == "POST":
        secret_key = request.form.get("secret_key")
        database_url = request.form.get("database_url")

        if not secret_key or not database_url:
            flash("Todos os campos são obrigatórios!", "danger")
            return render_template("initial_setup.html")

        with open(".env", "w") as f:
            f.write(f"SECRET_KEY={secret_key}\n")
            f.write(f"DATABASE_URL={database_url}\n")
        
        load_dotenv() # Recarrega as variáveis de ambiente
        flash("Configuração salva com sucesso!", "success")
        return redirect(url_for("index"))

    return render_template("initial_setup.html")


