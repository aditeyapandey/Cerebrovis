import json
import neurom as nm
import numpy as np
import csv

import json
from pprint import pprint
from glob import glob

directory = glob("*/")
print directory

#dir=['BG0002/']

for dir in directory:
	with open(dir+"alldata.json") as f:
	    dataXYZ = json.load(f)

	keys = list(dataXYZ.keys())
	results = map(int, keys)
	results.sort()

	#print dataXYZ

	with open(dir+'width.json') as f:
	    dataWidth = json.load(f)

	#print dataWidth


	with open(dir+dir.split("/")[0]+"records.swc", "w") as record_file:
	    record_file.write("1"+" "+ str(dataXYZ[str(results[0])]['type']) +" "+str(dataXYZ[str(results[0])]['x1'])+" "+str(dataXYZ[str(results[0])]['y1'])+" "+str(dataXYZ[str(results[0])]['z'])+" "+str(dataWidth[str(results[0])])+" "+"-1"+"\n")
	    for key,val in enumerate(results):
	        #print dataXYZ[str(results[key])]['nodeid']
	        record_file.write(str(dataXYZ[str(results[key])]['nodeid'])+" "+ str(dataXYZ[str(results[key])]['type']) +" "+str(dataXYZ[str(results[key])]['x1'])+" "+str(dataXYZ[str(results[key])]['y1'])+" "+str(dataXYZ[str(results[key])]['z'])+" "+str(dataWidth[str(results[key])])+" "+str(dataXYZ[str(results[key])]['parent'])+"\n")
	        #record_file.write(str(dataXYZ[str(results[key])]['nodeid'])+"\n")