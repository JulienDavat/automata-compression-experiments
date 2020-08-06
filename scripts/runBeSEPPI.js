#!/usr/bin/env node

const fs = require('fs')
const DOMParser = require('xmldom').DOMParser
const program = require('commander')
const cloneDeep = require('lodash').cloneDeep
const { sha1 } = require('object-hash')
const info = require('debug')('level:info')
const debug = require('debug')('level:debug')

class Comunica {

    constructor(server, graph) {
        this.server = server
        this.graph = graph
    }

    execSelectQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../bin/comunica.js ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2]),
                    nbResults: solutions.results.bindings.length
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }

    execAskQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../bin/comunica.js ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2])
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }
}

class SageMonoPredicateAutomata {

    constructor(server, graph) {
        this.server = server
        this.graph = graph
    }

    execSelectQuery(query){
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../node_modules/.bin/mono-sage-select ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2]),
                    nbResults: solutions.results.bindings.length
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }

    execAskQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../node_modules/.bin/mono-sage-ask ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2])
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }
}

class SageMultiPredicateAutomata {

    constructor(server, graph) {
        this.server = server
        this.graph = graph
    }

    execSelectQuery(query){
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../node_modules/.bin/multi-sage-select ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2]),
                    nbResults: solutions.results.bindings.length
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }

    execAskQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `node ../node_modules/.bin/multi-sage-ask ${this.server} ${this.graph} -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString())
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[2])
                }
            }
        } catch (error) {
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }
}

class SageJena {

    constructor(server, graph) {
        this.server = server
        this.graph = graph
    }

    execSelectQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `sage-jena ${this.graph} --format json -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString('utf-8'))
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[3]),
                    nbResults: solutions.results.bindings.length
                }
            }
        } catch (error) {
            console.log(error)
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }

    execAskQuery(query) {
        let exec = require('child_process').execSync
        let out = "out.json"
        let stats = "stats.csv"
        try {
            let cmd = `sage-jena ${this.graph} --format json -q '${query}' -o ${out} -m ${stats}`
            exec(cmd, { encoding: 'utf-8' })
            let solutions = JSON.parse(fs.readFileSync(out).toString('utf-8'))
            let statistics = fs.readFileSync(stats).toString().split(',')
            return {
                output: solutions,
                statistics: {
                    time: parseInt(statistics[0]),
                    httpCalls: parseInt(statistics[1]),
                    transfer: parseInt(statistics[3])
                }
            }
        } catch (error) {
            console.log(error)
            return {error: true, message: error}
        } finally {
            try {
                exec(`rm ${out}`, { encoding: 'utf-8' })
                exec(`rm ${stats}`, { encoding: 'utf-8' })
            } catch (error) {}
        }
    }
}

function intersection(reference, actual) {
    let missing = []
    let correct = []
    let incorrect = []
    let solutions = new Map()
    let hash2solution = new Map()
    for (let bindings of reference.results.bindings) {
        let hash = sha1(bindings)
        if (solutions.has(hash)) {
            let nbDuplicate = solutions.get(hash)
            solutions.set(hash, nbDuplicate + 1)
        } else {
            solutions.set(hash, 1)
            hash2solution.set(hash, bindings)
        }
    }
    for (let bindings of actual.results.bindings) {
        let hash = sha1(bindings)
        if (solutions.has(hash)) {
            correct.push(bindings)
            let nbDuplicate = solutions.get(hash)
            if (nbDuplicate === 1) {
                solutions.delete(hash)
            } else {
                solutions.set(hash, nbDuplicate - 1)
            }
        } else {
            incorrect.push(bindings)
        }
    }
    for (let key of solutions.keys()) {
        for (let i = 0, j = solutions.get(key); i < j; i++) {
            missing.push(hash2solution.get(key))
        }
    }
    debug(`${missing.length} missing solutions`)
    debug(JSON.stringify(missing, null, 2))
    debug(`${correct.length} correct solutions`)
    debug(JSON.stringify(correct, null, 2))
    debug(`${incorrect.length} incorrect solutions`)
    debug(JSON.stringify(incorrect, null, 2))
    return correct
}

function getCompletenessAndSoundness(reference, actual) {
    let inter = intersection(reference, actual)
    let result = {}
    if (reference.results.bindings.length == 0) {
        result['completeness'] = 1.0
        result['soundness'] = 1.0
        if (actual.results.bindings.length > 0) {
            result['soundness'] = 0.0
        }
        return result
    }
    if (actual.results.bindings.length == 0) {
        result['completeness'] = 1.0
        result['soundness'] = 1.0
        if (reference.results.bindings.length == 0) {
            result['completeness'] = 0.0
        }
        return result
    }
    result['completeness'] = inter.length / reference.results.bindings.length
    result['soundness'] = inter.length / actual.results.bindings.length
    info(`completeness = ${result['completeness']}`)
    info(`soundness = ${result['soundness']}`)
    return result
}

function runBenchmark(engine, benchmarkPath, outputPath, pass) {
    let tests = fs.readFileSync(benchmarkPath).toString()
    tests = JSON.parse(tests)

    graph = tests['graph']
    askQueries = tests['ask']
    selectQueries = tests['select']

    let numberOfQueries = askQueries.length + selectQueries.length

    let out = Array(numberOfQueries)

    askQueries.forEach(function(test, index) {
        out[index] = new Object()
        out[index]['name'] = test['name']
        out[index]['type'] = test['type']
    })

    selectQueries.forEach(function(test, index) {
        out[askQueries.length + index] = new Object()
        out[askQueries.length + index]['name'] = test['name']
        out[askQueries.length + index]['type'] = test['type']
    })

    let executionTimes = Array(numberOfQueries).fill(null).map(() => Array(pass))
    let transferSizes = Array(numberOfQueries).fill(null).map(() => Array(pass))
    let nbRequests = Array(numberOfQueries).fill(null).map(() => Array(pass))
    let completeness = Array(numberOfQueries).fill(null).map(() => Array(pass))
    let soundness = Array(numberOfQueries).fill(null).map(() => Array(pass))
    let errors = Array(numberOfQueries)

    for (let currentRun = 0; currentRun < pass; currentRun++) { // currentRun = -2
        askQueries.forEach(function(test, index) {
            info(`query = ${test['query']}`)
            answer = engine.execAskQuery(test['query'])
	        info(`result = ${JSON.stringify(answer, null, 2)}`)
            if (currentRun >= 0) {
                if (!answer.error) {
                    if (test.results.boolean === answer.output.boolean) {
                        executionTimes[index][currentRun] = answer.statistics.time
                        transferSizes[index][currentRun] = answer.statistics.transfer
                        nbRequests[index][currentRun] = answer.statistics.httpCalls
                        soundness[index][currentRun] = 1.0
                        completeness[index][currentRun] = 1.0
                    } else {
                        executionTimes[index][currentRun] = answer.statistics.time
                        transferSizes[index][currentRun] = answer.statistics.transfer
                        nbRequests[index][currentRun] = answer.statistics.httpCalls
                        soundness[index][currentRun] = 0.0
                        completeness[index][currentRun] = 0.0
                    }
                    errors[index] = false
                } else {
                    executionTimes[index][currentRun] = 0
                    transferSizes[index][currentRun] = 0
                    nbRequests[index][currentRun] = 0
                    soundness[index][currentRun] = 0.0
                    completeness[index][currentRun] = 0.0
                    errors[index] = true
                }
            }
            info(`${outputPath.split('_')[0]}_ask[${currentRun}][${index}]`)
        })
        selectQueries.forEach(function(test, index){
            info(`query = ${test['query']}`)
            answer = engine.execSelectQuery(test['query'])
	        info(`result = ${JSON.stringify(answer, null, 2)}`)
            if (currentRun >= 0) {
                if (!answer.error) {
                    executionTimes[askQueries.length + index][currentRun] = answer.statistics.time
                    transferSizes[askQueries.length + index][currentRun] = answer.statistics.transfer
                    nbRequests[askQueries.length + index][currentRun] = answer.statistics.httpCalls
                    completenessAndSoundness = getCompletenessAndSoundness(test, answer.output)
                    soundness[askQueries.length + index][currentRun] = completenessAndSoundness['soundness']
                    completeness[askQueries.length + index][currentRun] = completenessAndSoundness['completeness']
                    errors[askQueries.length + index] = false
                } else {
                    executionTimes[askQueries.length + index][currentRun] = 0
                    transferSizes[askQueries.length + index][currentRun] = 0
                    nbRequests[askQueries.length + index][currentRun] = 0
                    soundness[askQueries.length + index][currentRun] = 0.0
                    completeness[askQueries.length + index][currentRun] = 0.0
                    errors[askQueries.length + index] = true
                }
            }
            info(`${outputPath.split('_')[0]}_select[${currentRun}][${index}]`)
        })
    }
    let executionTimesAverages = evaluateAverages(executionTimes)
    let transferSizesAverages = evaluateAverages(transferSizes)
    let nbRequestsAverages = evaluateAverages(nbRequests)
    let soundnessLowest = evaluateComSound(soundness)
    let completeLowest = evaluateComSound(completeness)
    
    for (let i = 0; i < out.length; i++) {
        out[i]['executionTime'] = Math.floor(executionTimesAverages[i])
        out[i]['transferSize'] = Math.floor(transferSizesAverages[i])
        out[i]['requests'] = Math.floor(nbRequestsAverages[i])
        out[i]['completeness'] = completeLowest[i]
        out[i]['soundness'] = soundnessLowest[i]
        out[i]['error'] = errors[i]
    }

    fs.writeFileSync(outputPath, JSON.stringify(out, null, 4))
}

function evaluateAverages(values) {
    let averages = new Array(values.length).fill(0.0)
    for (let i = 0; i < values.length; i++) {
        let currentValues = values[i]
        currentValues.sort()
        let sum = 0
        for (let j = 0; j < currentValues.length - 0; j++) { // 1 -1
            sum += currentValues[j]
        }
        averages[i] = sum / (currentValues.length - 0) // -2
    }
    return averages
}

function evaluateComSound(values) {
    let results = new Array(values.length).fill(0.0)
    for (let i = 0; i < values.length; i++) {
        let currentResults = values[i]
        currentResults.sort()
        results[i] = currentResults[0]
    }
    return results
}

// Main

program.description('Measure completeness, soundness, executions times, data transfer size and number of requests for SPARQL queries')
    .usage('<queries> [options]')
    .option('-c, --config <file>', 'approaches parameters for which we want to run BeSEPPI')
    .option('-p, --pass <number>', 'number of times each request is ran')
    .parse(process.argv)

if (program.args.length < 1) {
    process.stderr.write('Error: you must specify the path to the queries file.\n')
    process.exit(1)
}

if (!program.config) {
    process.stderr.write('Error: you must specify the path to the configuration file.\n')
    process.exit(1)
}

let pass = program.pass != undefined ? program.pass : 3
let config = JSON.parse(fs.readFileSync(program.config, {encoding: 'utf-8'}).toString())

for (let approach of config.approaches) {
    console.log(approach)
    switch (approach.id) {
        case "sage-mono-predicate-automata":
            runBenchmark(new SageMonoPredicateAutomata(approach.server, approach.graph), program.args[0], approach.output, pass)
            break
        case "sage-multi-predicate-automata":
            runBenchmark(new SageMultiPredicateAutomata(approach.server, approach.graph), program.args[0], approach.output, pass)
            break
        case "comunica":
            runBenchmark(new Comunica(approach.server, approach.graph), program.args[0], approach.output, pass)
            break
        case "sage-jena":
            runBenchmark(new SageJena(approach.server, approach.graph), program.args[0], approach.output, pass)
            break
        default:
            process.stderr.write(`Warning: unknown approach ${approach.id}.\n`)
    }
}