#!/usr/bin/env node

// ---- IMPORTS ----------

const fs = require('fs')
const program = require('commander')
const newEngine = require('@comunica/actor-init-sparql').newEngine;

// ---- FUNCTIONS ----------

function replace() {
    // (NODE ONLY) before all replace manually Requester.js in actor-http-native
    fs.writeFileSync(`${__dirname}/../node_modules/@comunica/actor-http-native/lib/Requester.js`, fs.readFileSync(`${__dirname}/Requester.js`, 'utf-8'))
    fs.writeFileSync(`${__dirname}/../node_modules/@comunica/actor-http-native/lib/ActorHttpNative.js`, fs.readFileSync(`${__dirname}/ActorHttpNative.js`, 'utf-8'))
}

// ---- MAIN ----------

program
  .description('Execute a SPARQL query using a SaGe server and the IRI of the default RDF graph')
  .usage('<server-url> <default-graph-iri> [options]')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query stored in the given file')
  .option('-o, --output <output>', 'evaluates the SPARQL query in the given file')
  .option('-m, --measure <measure>', 'measure the query execution time (in seconds) & append it to a file')
  .option('-t, --timeout <timeout>', 'stops the query execution after the given time limit (in seconds)', 600)
  .parse(process.argv)

if (program.args.length !== 2) {
    process.stderr.write('Error: you must input exactly one server and one default graph IRI to use.\nSee rewrite_using_stats --help for more details.\n')
    process.exit(1)
}

// fetch SPARQL query to analyse
let query = null
if (program.query) {
    query = program.query
} else if (program.file && fs.existsSync(program.file)) {
    query = fs.readFileSync(program.file, 'utf-8')
} else {
    process.stderr.write('Error: you must input a SPARQL query to evaluate.\nSee rewrite_using_stats --help for more details.\n')
    process.exit(1)
}

// replace the HTTP actor of comunica by ours in order to retrieve information about query execution
replace()
let A = require('@comunica/actor-http-native').ActorHttpNative
let stats = A.stats
stats.nbResults = 0

let promise = new Promise((resolve, reject) => {
    let subscription = setTimeout(function() {
        reject('TimeoutException')
    }, program.timeout * 1000)

    const engine = newEngine()
    engine.query(query, {
        sources: [program.args[1]]
    }).then((result) => {
        engine.resultToString(result, 'application/sparql-results+json', result.context).then((d) => {
            res = ''
            d.data.on('data', (a) => {
                let str = String.fromCharCode(...a)
                try {
                    JSON.parse(str)
                    stats.nbResults++
                } catch (error) {}
                res += a
            })
            d.data.on('end', () => {
                clearTimeout(subscription)
                resolve(res)
            })
        })
    }).catch((error) => {
        reject(error)
    })
})

let startTime = Date.now()

promise.then(function(result) {
    let endTime = Date.now()
    let time = endTime - startTime
    let solutions = JSON.parse(result)
    if (solutions.boolean) {
        if (program.measure) {
            fs.appendFileSync(program.measure, `${time},${stats.calls},${stats.bytes},complete`)
        } 
        if (program.output) {
            fs.appendFileSync(program.output, JSON.stringify(solutions, null, 2))
        }
        process.stdout.write(`SPARQL query evaluated in ${time / 1000}s with ${stats.calls} HTTP request(s). ${Math.round(stats.bytes / 1024)} KBytes transfered. ${stats.nbResults} results !\n`)
    } else {
        if (program.measure) {
            fs.appendFileSync(program.measure, `${time},${stats.calls},${stats.bytes},${stats.nbResults},complete`)
        } 
        if (program.output) {
            fs.appendFileSync(program.output, JSON.stringify(solutions, null, 2))
        }
        process.stdout.write(`SPARQL query evaluated in ${time / 1000}s with ${stats.calls} HTTP request(s). ${Math.round(stats.bytes / 1024)} KBytes transfered.\n`)
    }
    process.exit(0)
}).catch(function(error) {
    let endTime = Date.now()
    let time = endTime - startTime

    let state = 'error'
    if (error === 'TimeoutException' || error.message === 'TimeoutException') {
        state = 'interrupted'
    }

    if (program.measure) {
        fs.appendFileSync(program.measure, `${time},${stats.calls},${stats.bytes},${stats.nbResults},${state}`)
    }

    process.stdout.write(`${state === 'error' ? 'An error occured' : 'SPARQL query interrupted'} after ${time / 1000}s. ${stats.calls} HTTP request(s) sent. ${Math.round(stats.bytes / 1024)} KBytes transfered. ${stats.nbResults} results retrieved !\n`)
    process.exit(1)
})