import fitz,json,itertools
from pathlib import Path
page=fitz.open('art/reference/rules-2010.pdf')[7]
marks=[((w[0]+w[2])/2,(w[1]+w[3])/2,w[4]=='✓') for w in page.get_text('words') if w[4] in ['✓','×']]
configs=[
 ('gardens',[55,56,57,58,80,81,82,83,84,85,86],[12,13,14,15,30,31,33,34,35,51,52,53,54,55,56,57,58,80,81,82,83,84,85],(35,215,215,470)),
 ('cloister',[65,66,67,68,73,74,75,76,90,91,92,93,94],[37,38,39,40,41,46,47,48,49,62,63,64,65,66,67,68],(245,455,290,465)),
 ('chapel',[59,60,61,77,78,79,87,88,89,103,104,105,106,107,112,113,114,115,116,129,130,131,134,135],[103,104,105,106,107,112,113,114,115,116,129,130,131,134,135,150],(60,445,508,677)),
 ('outside',[132,133,151,152,153,154],[110,132,133,151,152,153],(360,451,538,598))]
tables=[];pairs={}
for name,cols,rows,box in configs:
 subset=[m for m in marks if box[0]<m[0]<box[1] and box[2]<m[1]<box[3]]
 # Outside table occupies the unused upper-right triangle of the Chapel table.
 if name=='chapel':subset=[m for m in subset if not(m[0]>360 and m[1]<597)]
 ys=sorted(set(round(y,1) for x,y,v in subset));xs=sorted(set(round(x,1) for x,y,v in subset));
 # Cross/check glyphs have the same center; tolerate rounding 0.1 px.
 cluster=[]
 for x in xs:
  if not cluster or x-cluster[-1]>1:cluster.append(x)
 xs=cluster
 assert len(ys)==len(rows),(name,len(ys),len(rows))
 assert len(xs)==len(cols),(name,len(xs),len(cols))
 cells=[]
 for x,y,value in subset:
  row=rows[min(range(len(ys)),key=lambda i:abs(y-ys[i]))];col=cols[min(range(len(xs)),key=lambda i:abs(x-xs[i]))]
  key=tuple(sorted([row,col]));assert key not in pairs or pairs[key]==value,(name,key)
  pairs[key]=value;cells.append({'from':row,'to':col,'visible':value})
 tables.append({'name':name,'columns':cols,'rows':rows,'cells':cells})
for group in [[12,13,14,15,30,31,33,34,35,51,52,53,54],[37,38,39,40,41,46,47,48,49,62,63,64],[73,74,75,76,90,91,92,93,94],[59,60,61,77,78,79,87,88,89]]:
 for a,b in itertools.combinations(group,2):
  value=not(33 in [a,b] and (a if b==33 else b) in [12,13,14,15,30,31]);key=tuple(sorted([a,b]));assert key not in pairs or pairs[key]==value
  pairs[key]=value
result={'source':'Mayfair 2010 rulebook, page 8; table glyphs extracted with PDF coordinates, plus the printed all-visible group statements.','tables':tables,'pairs':[{'a':a,'b':b,'visible':v} for (a,b),v in sorted(pairs.items())]}
Path('src/lib/game/sight-tables.json').write_text(json.dumps(result,indent=2)+'\n');print('Table cells',sum(len(t['cells']) for t in tables),'unique authoritative pairs',len(pairs))
