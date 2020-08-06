from pandas import read_csv, concat
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.colors import to_rgba_array
from seaborn import barplot
from argparse import ArgumentParser, ArgumentTypeError
from os import listdir, getcwd
from matplotlib.colors import ListedColormap
from matplotlib.lines import Line2D
import matplotlib.patches as mpatches
import json
import sys

# =======================================================================================
# ========= Functions ===================================================================
# =======================================================================================

def updateUnits(df):
    df['dataTransfer'] = df['dataTransfer'].div(1024)#.round(2)
    df['time'] = df['time'].div(1000)#.round(2)


def plot(axe, data, metric, axe_label):
    chart = barplot(x="query", y=metric, ax=axe, hue="approach", data=data)
    axe.set_yscale("log")
    axe.set_title(axe_label, fontsize=12)
    axe.set_xlabel('')
    axe.set_ylabel('', fontsize=12)
    axe.get_legend().remove()

def find_csv_filenames( path_to_dir, suffix="metrics.csv" ):
    filenames = listdir(path_to_dir)
    return [ filename for filename in filenames if filename.endswith( suffix ) ]

def get_label(filename, config):
    for item in config['data']:
        if filename == item['file']:
            return item['label']
    return None

# =======================================================================================
# ========= Main ========================================================================
# =======================================================================================

# Initiates the parser
parser = ArgumentParser()

# Adds long and short argument
parser.add_argument("--input", "-i", help="The folder where statistics files are stored", default=None)
parser.add_argument("--output", "-o", help="The folder where the figure will be saved", default=None)
parser.add_argument("--config", "-c", help="The configuration file (JSON)")

# Reads arguments from the command line
args = parser.parse_args()

inputDirectory = args.input
outputDirectory = args.output
config = None

# Checks and retrieves arguments
if args.config:
    with open(args.config) as json_file:
        config = json.load(json_file)
else:
    print('Error: config file missing...')
    sys.exit(1)

if inputDirectory == None:
    inputDirectory = getcwd()

if outputDirectory == None:
    outputDirectory = getcwd()

# Loads data
data = []
filenames = find_csv_filenames(inputDirectory)
for filename in filenames:
    label = get_label(filename, config)
    if (label != None):
        df = read_csv("{}/{}".format(inputDirectory, filename), sep=',')
        df.sort_values(by=['query'])
        df['approach'] = label
        updateUnits(df)
        data.append(df)

if (len(data) == 0):
    print('Error: no data found...')
    sys.exit(1)

# Concats query results for each approach
data = concat(data)

# Discards queries that have been interrupted
discardedQueries = data[(data['state'] == 'error')]['query'].unique()
data = data[~data['query'].isin(discardedQueries)]

# excludedQueries = ['shop_query-2', 'shop_query-6', 'shop_query-9', 'shop_query-10', 'shop_query-14', 'shop_query-15', 'shop_query-18', 'shop_query-19', 'shop_query-26', 'shop_query-27']
# data = data[~data['query'].isin(excludedQueries)]

numberOfSubplots = len(config['subplots'])

# builds the figure
figure, axes = plt.subplots(numberOfSubplots, 1, figsize=[7.4, 7.0])
figure.suptitle(config['figure']['title'], fontsize=14)

# builds subplots
for i in range(0, numberOfSubplots):
    plot(axes[i], data, config['subplots'][i]['metric'], config['subplots'][i]['axe_label'])

for i in range(0, numberOfSubplots - 1):
    axes[i].set_xticklabels([])

axes[numberOfSubplots - 1].set_xticklabels(
    [textObject.get_text().split('-')[1] for textObject in axes[numberOfSubplots - 1].get_xticklabels()],
    rotation=90, 
    horizontalalignment='center',
    fontweight='light',
    fontsize='large'
)

# builds the legend
handles, labels = axes[0].get_legend_handles_labels()
lgd = figure.legend(handles, labels, loc='lower center', ncol=3)

# Adjusts the size of the figure
plt.tight_layout(w_pad=1, rect=[0,0,1,1])
figure.subplots_adjust(bottom=0.15)

# Highlights queries that have been interrupted
states = data['state'].tolist()
for i in range(numberOfSubplots):
    for j in range(len(states)):
        bar = axes[i].patches[j]
        if (states[j] == 'interrupted'):
            bar.set_hatch('//')

# saves the image in the output directory
imageName = args.config.split('.json')[0].split('/')[-1]
figure.savefig('{}/{}_barplot.png'.format(outputDirectory, imageName, bbox_inches='tight', dpi=100))