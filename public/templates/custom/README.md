# Custom Templates Directory

Place your custom template HTML files in this directory. Templates should be named with a consistent pattern like `template-name.html`.

## Template Variables

Templates can use the following variables which will be replaced with actual values:

- `{{catalogName}}` - The name of the catalog
- `{{catalogDescription}}` - The description of the catalog
- `{{businessName}}` - The name of the business
- `{{generatedDate}}` - The date the catalog was generated
- `{{products}}` - The product list HTML will be inserted here

## Example Template

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{catalogName}}</title>
  <style>
    /* Your custom CSS here */
    body { font-family: Arial, sans-serif; }
    .header { text-align: center; }
    /* etc. */
  </style>
</head>
<body>
  <div class="header">
    <h1>{{catalogName}}</h1>
    <p>{{catalogDescription}}</p>
    <p>{{businessName}}</p>
  </div>
  
  <div class="products">
    {{products}}
  </div>
  
  <div class="footer">
    <p>Generated on {{generatedDate}}</p>
  </div>
</body>
</html>
```