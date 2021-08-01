import Element from "./index";
const html = `
<html>
<head></head>
<body>
  <div id='books'>
    <ul>
      <li class='book'>Book1</li>
      <li class='book'>Book2</li>
      <li class='book' style='display:none'>Hidden book</li>
      <li class='book'>Book3</li>
    </ul>
  </div>
</body>
</html>
`;
const rootElement = Element.parse(html);
const booksDiv = rootElement.find(el => el.tag == 'div' && el.attr.id == 'books')!;
for (const bookElement of booksDiv.filter(el => el.attr.class == 'book')) {
  if (bookElement.attr.style != 'display:none')
    console.log(bookElement.value);
}