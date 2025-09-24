## My Blogspot in NodeJS
### Startup
Insert [API Key](https://developers.google.com/blogger/docs/3.0/using) in .env
###### .env
```
BLOGGER_API_KEY=
```
[Get the ID of your Blog](https://support.google.com/blogger/thread/211636138?hl=en&msgid=211650454)
###### app.config.js
```
blogger: {
    ...
    blogId: 'here'
    ...
}
```
Download your Blogspot with the command:
```
yarn run api:blogger export
```
convert it
```
yarn run api:blogger convert
```
api lib
```
yarn run build
```
then run
```
yarn run start
```