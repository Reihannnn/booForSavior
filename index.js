import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000; 

let bookItem = []
// let item = []

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookLibrary",
  password: "gurita123456",
  port: 5432,
});
db.connect();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req,res) =>{
  // nnome page
  res.render("home.ejs")
})

app.get("/books" , async (req,res) =>{
    const getData = await db.query(`select * from bookItems`)
    bookItem = getData.rows
  
    res.render("books.ejs", {
      item : bookItem
    })
})

app.get('/books/:isbn', async (req, res) => {
  const { isbn } = req.params;

  try {
    // Fetch data buku dari Open Library API
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const bookData = response.data[`ISBN:${isbn}`];
    
    console.log(bookData)
    console.log(bookData.cover.large)

    if (bookData) {
      // Render template EJS dengan data buku
      res.render('specificBooks.ejs', { book: bookData });
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error fetching book data:', error);
    res.status(500).send('Failed to fetch book data');
  }
});


// post add book

app.post('/addBooks', async(req,res) =>{
  // const getTtitle = 
  try{
    res.render("addBooks.ejs")
  }catch(err){
    console.log(err)
  }
})

app.post("/addBooks/add", async (req, res) =>{
  try{
    // get from this atribut name in elemnet .title / .author / .isbn etc
    const getTitle = req.body.title 
    const getAuthor = req.body.author
    const getISBN = req.body.isbn
    const getRating = req.body.user_rating
    const getReview = req.body.review

    // get image use axios.get dengan patokan getISBN
    const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${getISBN}&format=json&jscmd=data`);
    
    const bookData = response.data[`ISBN:${getISBN}`];
    const getCover = bookData.cover.large

    // insert data from formPage to database 
    await db.query("insert into bookItems (title, author, isbn,cover_image_url,user_rating,review) values ($1,$2,$3,$4,$5,$6)", [getTitle,getAuthor,getISBN,getCover,getRating,getReview])

    res.redirect("/books")

  }catch(err){
    console.log(err)
  }
})



// jika route tidak terdaftar pada alamat yang sudah ditetapkan
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

app.listen(port, ()=>{
  console.log(`server running in localhost:${port}`)
})