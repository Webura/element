import Element from "./index";
const html = `
  <html>
  <head></head>
  <body>
    <div id='books'>
      <ul>
        <li class='book' data-year='2001'>Book1</li>
        <li class='book' data-year='2002'>Book2</li>
        <li class='book' data-year='2000' style='display:none'>Hidden book</li>
        <li class='book' data-year='2003'>Book3</li>
      </ul>
    </div>
  </body>
  </html>`;
const rootElement = Element.parse(html);
const booksDiv = rootElement.find(el => el.tag == 'div' && el.attr.id == 'books')!;
for (const bookElement of booksDiv.filter(el => el.attr.class == 'book')) {
  if (bookElement.attr.style != 'display:none')
    console.log(bookElement.value + ': ' + bookElement.attr['data-year']);
}
// Book1: 2001
// Book2: 2002
// Book3: 2003