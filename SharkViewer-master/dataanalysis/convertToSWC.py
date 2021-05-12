import json
import neurom as nm
import numpy as np
import csv

import json
from pprint import pprint

with open('BG0003.json') as f:
    dataXYZ = json.load(f)

keys = list(dataXYZ.keys())
results = map(int, keys)
results.sort()

#print dataXYZ

with open('BG0003Width.json') as f:
    dataWidth = json.load(f)

print dataXYZ[str(results[0])]



with open("records.swc", "w") as record_file:
    for key,val in enumerate(results):
        #print dataXYZ[str(results[key])]['nodeid']
        record_file.write(str(dataXYZ[str(results[key])]['nodeid'])+" "+ str(dataXYZ[str(results[key])]['type']) +" "+str(dataXYZ[str(results[key])]['x1'])+" "+str(dataXYZ[str(results[key])]['y1'])+" "+str(dataXYZ[str(results[key])]['z'])+" "+str(dataWidth[str(results[key])])+" "+str(dataXYZ[str(results[key])]['parent'])+"\n")
        #record_file.write(str(dataXYZ[str(results[key])]['nodeid'])+"\n")