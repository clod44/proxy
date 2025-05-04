import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

const routesPath = path.join(__dirname, 'routes')
const routeFiles = fs.readdirSync(routesPath)


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


routeFiles.forEach((file) => {
    console.log(">> adding: " + file);
    const filePath = path.join(routesPath, file)

    try {
        const route = require(filePath)
        if (route && route.default) {
            console.log(`Loaded route: ${file}`)
            app.use(route.default)
        } else {
            console.warn(`Route file '${file}' does not have a valid default export.`)
        }
    } catch (error) {
        console.error(`Failed to load route '${file}':`, error)
    }
})

app.listen(port, () => {
    console.log(`\nProxy server running on port ${port}`)
})
