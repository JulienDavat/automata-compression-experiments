#!/bin/bash

GRAPH=$1
QUERIES=$2
OUTPUT=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run.sh <graph> <queries-directory> <output-folder>"
  exit 1
fi

mkdir $OUTPUT 1> /dev/null 2>&1
mkdir ${OUTPUT}/images 1> /dev/null 2>&1

QUERY_TIMEOUT=1800 # 30 minutes

SAGE_SERVER="http://localhost:8080/sparql"
SAGE_GRAPH="http://localhost:8080/sparql/${GRAPH}"

TPF_SERVER="http://localhost:8000/"
TPF_GRAPH="http://localhost:8000/${GRAPH}"

bash ./sage_mono_automaton.sh $SAGE_SERVER $SAGE_GRAPH $QUERIES $OUTPUT $QUERY_TIMEOUT

bash ./sage_multi_automaton.sh $SAGE_SERVER $SAGE_GRAPH $QUERIES $OUTPUT $QUERY_TIMEOUT

bash ./jena_sage.sh $SAGE_SERVER $SAGE_GRAPH $QUERIES $OUTPUT $QUERY_TIMEOUT

bash ./comunica.sh $TPF_SERVER $TPF_GRAPH $QUERIES $OUTPUT $QUERY_TIMEOUT

python3 ./plots/plot_metrics.py --input $OUTPUT --out ${OUTPUT}/images --config ./plots/config/gmark_shop_mono_vs_multi_predicate_automata.json

python3 ./plots/plot_metrics.py --input $OUTPUT --out ${OUTPUT}/images --config ./plots/config/gmark_shop_sage_vs_jena_vs_comunica.json