# SWFLoader
## How to use

1. Add prototype to the document
2. Add swfloader.js to the document head
```html
<script language='javascript' type='text/javascript' src='swfloader.js'>&#160;</script>
```
3. Load the flash file into swfloader (check the SWFLoader class for more optional params)
```html
    <script language='javascript' type='text/javascript'>
        swfloader.load("divname", "swfname", "filename.swf", 220, 300, "#FFFFFF");
    </script>
```
