
const isUndefined = require('lodash/isUndefined')
const express = require('express')


const Foo = class {
    constructor () {
        this.router = express.Router()
        this.cache = {}
        this.cacheArr = []
        this.currPath = null
    }

    path ({
        method = 'get',
        path = '/'
    } = {}) {
        const currPath = Symbol(`${ method } ${ path }`)
        this.cache[currPath] = {
            method,
            path,
            controllers: []
        }
        this.currPath = currPath
        this.cacheArr.push(this.cache[currPath])
        return this
    }

    controller (controller) {
        const {
            cache,
            currPath
        } = this
        if (!isUndefined(cache[currPath])) {
            cache[currPath].controllers.push(controller)
        }
        return this
    }

    generate ({
        method,
        path,
        controllers
    }) {
        if (controllers.length < 1) {
            return
        }

        const lastOne = controllers.splice(controllers.length - 1)[0]

        const controller = async function (req, res, next) {
            try {
                const data = await lastOne(req)
                if (req.routerResponseType === 'plainHTML') {
                    return res.send(data)
                }
                if (req.routerResponseType === 'xml') {
                    res.header('Content-Type', 'application/xml; charset=utf-8')
                    return res.send(data)
                }

                const json = {
                    code: 200
                }

                if (!isUndefined(data)) {
                    json.data = data
                }

                return res.json(json)
            } catch (err) {
                return next(err)
            }
        }

        controllers.push(controller)

        this.router[method](path, ...controllers)
    }

    end () {
        const {
            cacheArr
        } = this
        for (const router of cacheArr) {
            this.generate(router)
        }

        return this.router
    }

    get (path) {
        return this.path({
            path
        })
    }

    post (path) {
        return this.path({
            method: 'post',
            path
        })
    }

    put (path) {
        return this.path({
            method: 'put',
            path
        })
    }

    patch (path) {
        return this.path({
            method: 'patch',
            path
        })
    }

    delete (path) {
        return this.path({
            method: 'delete',
            path
        })
    }

    head (path) {
        return this.path({
            method: 'head',
            path
        })
    }
}


module.exports = Foo
