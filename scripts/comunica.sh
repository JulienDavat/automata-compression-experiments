#!/bin/bash

SERVER=$1
DEFAULT_GRAPH=$2
QUERIES=$3
OUTPUT=$4
QUERY_TIMEOUT=$5

if [ "$#" -ne 5 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_comunica.sh <server> <default-graph> <queries-directory> <output-folder> <query-timeout>"
  exit 1
fi

START=1
END=3

mkdir -p ${OUTPUT}/results/comunica/ 1> /dev/null 2>&1
mkdir -p ${OUTPUT}/temp/ 1> /dev/null 2>&1

RESFILE_TEMP="${OUTPUT}/temp/comunica_metrics.csv"
RESFILE="${OUTPUT}/comunica_metrics.csv"

# init results file with headers
echo "query,time,httpCalls,dataTransfer,nbResults,state" > $RESFILE_TEMP

for i in $(seq $START $END); do
    echo "Iteration n°${i}"
    for qfile in ${QUERIES}/*.sparql; do
        qname=`basename ${qfile} .sparql`
        echo "Processing file: ${qname}"

        if [ "$i" -eq 0 ]; then
            # cold evaluation of the query (result and statistics are not retrieved)
            node --max-old-space-size=16384 ../bin/comunica.js $SERVER $DEFAULT_GRAPH --file $qfile --timeout $QUERY_TIMEOUT
        else
            echo -n "${qname}," >> $RESFILE_TEMP
            
            # warm evaluation of the query (result and statistics are retrieved)
            node --max-old-space-size=16384 ../bin/comunica.js $SERVER $DEFAULT_GRAPH --file $qfile --timeout $QUERY_TIMEOUT --output ${OUTPUT}/results/comunica/${qname}.json --measure ${OUTPUT}/results/comunica/${qname}.csv

            if [ -f ${OUTPUT}/results/comunica/${qname}.csv ]; then
                time=$(cat ${OUTPUT}/results/comunica/${qname}.csv | awk -F',' '{printf "%s", $1}' | tr -d '"')
                httpCalls=$(cat ${OUTPUT}/results/comunica/${qname}.csv | awk -F',' '{printf "%s", $2}' | tr -d '"')
                dataTransfer=$(cat ${OUTPUT}/results/comunica/${qname}.csv | awk -F',' '{printf "%s", $3}' | tr -d '"')
                state=$(cat ${OUTPUT}/results/comunica/${qname}.csv | awk -F',' '{printf "%s", $5}' | tr -d '"')
                nbResults=0
                if [ "${state}" == "complete" ] && [ -f ${OUTPUT}/results/comunica/${qname}.json ]; then
                    nbResults=$(jq '.results.bindings | length' ${OUTPUT}/results/comunica/${qname}.json)
                fi
                echo "${time},${httpCalls},${dataTransfer},${nbResults},${state}" >> $RESFILE_TEMP
            else
                echo "0,0,0,0,error" >> $RESFILE_TEMP
            fi
        fi
    done
done

LC_ALL="C" awk -F ',' '
    NR>1{
        count[$1] += 1
        time[$1] += $2
        timeDetail[$1, count[$1]] = $2
        httpCalls[$1] += $3
        httpCallsDetail[$1, count[$1]] = $3
        dataTransfer[$1] += $4
        dataTransferDetail[$1, count[$1]] = $4
        nbResults[$1] = $5
        state[$1] = $6
    }
    END{
        for (query in count) {
            if (count[query] > 3) {
                minTime = timeDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (timeDetail[query, x] < minTime) {
                        minTime = timeDetail[query, x]
                    }
                }
                maxTime = timeDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (timeDetail[query, x] > maxTime) {
                        maxTime = timeDetail[query, x]
                    }
                }
                time[query] -= (minTime + maxTime)

                minHttpCalls = httpCallsDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (httpCallsDetail[query, x] < minHttpCalls) {
                        minHttpCalls = httpCallsDetail[query, x]
                    }
                }
                maxHttpCalls = httpCallsDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (httpCallsDetail[query, x] > maxHttpCalls) {
                        maxHttpCalls = httpCallsDetail[query, x]
                    }
                }
                httpCalls[query] -= (minHttpCalls + maxHttpCalls)

                minDataTransfer = dataTransferDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (dataTransferDetail[query, x] < minDataTransfer) {
                        minDataTransfer = dataTransferDetail[query, x]
                    }
                }
                maxDataTransfer = dataTransferDetail[query, 1]
                for (x = 2; x <= count[query]; x++) {
                    if (dataTransferDetail[query, x] > maxDataTransfer) {
                        maxDataTransfer = dataTransferDetail[query, x]
                    }
                }
                dataTransfer[query] -= (minDataTransfer + maxDataTransfer)
            }
        }
        print "query,time,httpCalls,dataTransfer,nbResults,state"
        for (query in count) {
            if (count[query] > 3) {
                print query "," (time[query] / (count[query] - 2)) "," (httpCalls[query] / (count[query] - 2)) "," (dataTransfer[query] / (count[query] - 2)) "," (nbResults[query]) "," (state[query])
            } else {
                print query "," (time[query] / count[query]) "," (httpCalls[query] / count[query]) "," (dataTransfer[query] / count[query]) "," (nbResults[query]) "," (state[query])
            }
            
        }
    }
' $RESFILE_TEMP >> $RESFILE

# remove tmp folders
rm -rf ${OUTPUT}/temp/ 1> /dev/null 2>&1
rm -rf ${OUTPUT}/results/comunica/ 1> /dev/null 2>&1