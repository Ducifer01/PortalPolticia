import os
from flask import Flask, render_template, redirect, url_for, request, flash, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


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
    is_highlighted = db.Column(db.Boolean, default=False) # Novo campo para post em destaque

    def __repr__(self):
        return f"Post(\'{self.title}\', \'{self.content[:20]}...\')"

@app.route("/")
def index():
    highlighted_post = Post.query.filter_by(is_highlighted=True).first()
    recent_posts = Post.query.order_by(Post.id.desc()).limit(5).all()
    return render_template("index.html", highlighted_post=highlighted_post, recent_posts=recent_posts)

@app.route("/admin")
def admin_dashboard():
    if "logged_in" not in session or not session["logged_in"]:
        flash("Por favor, faça login para acessar esta página.", "danger")
        return redirect(url_for("login"))
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template("admin/dashboard.html", posts=posts)
@app.route("/admin/new_post", methods=["GET", "POST"])
def new_post():
    if request.method == "POST":
        title = request.form["title"]
        content = request.form["content"]
        references = request.form["references"]
        is_highlighted = bool(request.form.get("is_highlighted"))
        
        if not title or not content:
            flash("Título e conteúdo são obrigatórios!", "danger")
        else:
            post = Post(title=title, content=content, references=references, is_highlighted=is_highlighted)
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
        post.is_highlighted = bool(request.form.get("is_highlighted"))
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
        load_dotenv() # Carrega as variáveis de ambiente
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
            f.write(f"ADMIN_USERNAME=admin\n") # Placeholder
            f.write(f"ADMIN_PASSWORD=adminpass\n") # Placeholder
        
        
        flash("Configuração salva com sucesso!", "success")
        return redirect(url_for("index"))

    return render_template("initial_setup.html")




@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
        ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["logged_in"] = True
            flash("Login bem-sucedido!", "success")
            return redirect(url_for("admin_dashboard"))
        else:
            flash("Usuário ou senha inválidos.", "danger")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.pop("logged_in", None)
    flash("Você foi desconectado.", "info")
    return redirect(url_for("index"))



