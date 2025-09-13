const links = {
    "/" : "Home",
    "/index" : "Index",
    "/login" : "Login",
    "/dashboard" : "Dashboard"
}
for (const [route, label] of Object.entries(links)) {
    console.log(`The route is "${route}" and the label is "${label}".`);
}
for (const route in links) {
    if (Object.hasOwn(links, route)) { // Use this check to be safe
        console.log(`The route is "${route}" and the label is "${links[route]}".`);
    }
}