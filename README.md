# automata-compression-experiments

This repository corresponds to the experimental study of our paper: How to execute SPARQL property path queries
online and get complete results?

## Abstract

SPARQL property path queries provide a concise way to
write complex navigational queries over RDF knowledge graphs. How-
ever, the evaluation of these queries over online knowledge graphs such
as DBPedia or Wikidata are often interrupted by quotas, returning no
results or partial results. Decomposing SPARQL property path queries
into triple pattern subqueries allows to get complete results. However,
such decomposition generates a high number of subqueries, a large data
transfer and finally delivers poor performances. In this paper, we pro-
pose an algorithm able to decompose SPARQL property path queries into
Basic Graph Pattern (BGP) subqueries. As BGP queries are guaranteed
to terminate on preemptable SPARQL servers, property path queries
always deliver complete results. Experimental results demonstrate that
our approach outperforms existing approaches in terms of HTTP calls,
data transfer and query execution time.

## Experiments scripts

All scripts used during experiments are available in the [scripts](https://github.com/JulienDavat/automata-compression-experiments/tree/master/scripts) directory.

## Softwares used

* [SaGe python server](https://github.com/sage-org/sage-engine)
* [SaGe java client](https://github.com/JulienDavat/sage-jena) (SaGe-Jena)
* [SaGe javascript client](https://github.com/JulienDavat/sage-client/tree/gmark-experiments-multi-predicate-automata) extended with the automata compression approach (SaGe-AC)
* [SaGe javascript client](https://github.com/JulienDavat/sage-client/tree/gmark-experiments-mono-predicate-automata) extended with the traditional automaton-based approach (SaGe-A)
* [TPF server](https://www.npmjs.com/package/ldf-server) v2.2.5
* [Comunica](https://www.npmjs.com/package/@comunica/actor-init-sparql) v1.12.1

## Installation

SaGe-AC, SaGe-A and Comunica are installed automatically when running the command *npm install*. TPF and SaGe servers, as well as the SaGe java client have to be installed manually.

## Dataset and queries

We used the [BeSEPPI benchmark](https://link.springer.com/chapter/10.1007/978-3-030-21348-0_31) to study the compliance of our approach with
the W3C semantics. BeSEPPI provides a dataset of 29 triples and 236 queries that are designed to test the different semantics aspects of SPARQL property path expressions. If an approach returns a complete and correct result for each of the 236 queries, then it follows the W3C semantics. Queries and the dataset are available in the [queries/beseppi](https://github.com/JulienDavat/automata-compression-experiments/tree/master/queries/beseppi) directory.

To compare our approach with Comunica and SaGe-Jena, we used the framework [gMark](https://github.com/gbagan/gmark). GMark allows to generate RDF graphs and workloads of SPARQL queries with property paths. In our experimental study, we generated a workload of 30 property path queries and a dataset of 1M triples using the default "Shop" scenario. Queries and the dataset are available in the [queries/gmark](https://github.com/JulienDavat/automata-compression-experiments/tree/master/queries/gmark-shop) directory.

## Results

### Evaluation of gMark queries with SaGe-AC and SaGe-A

![Mono-predicate vs Multi-predicate automata](https://github.com/JulienDavat/automata-compression-experiments/blob/master/results/images/mono_vs_multi_automaton.png)

### Evaluation of gMark queries with SaGe-AC, SaGe-Jena and Comunica

#### gMark queries without transitive path expressions

![transitive without path expressions](https://github.com/JulienDavat/automata-compression-experiments/blob/master/results/images/non_transitive_queries.png)

#### gMark queries with transitive path expressions

![transitive with path expressions](https://github.com/JulienDavat/automata-compression-experiments/blob/master/results/images/transitive_queries.png)
