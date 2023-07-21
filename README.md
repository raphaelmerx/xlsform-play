# XLSForm in-browser editing and preview

A React app that allows you to import, edit and preview an XLSForm, in one view. Deployed at https://xlsform.rapha.dev/.
## Dev setup

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Run the application using `npm start`.

## Backend

We use the xlsform-online.fly.dev API ([repo](https://github.com/raphaelmerx/xlsform-online)) for converting the XLSForm to XForm, then https://staging.enketo.getodk.org/ in an iframe to preview the form.
