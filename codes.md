

```
node -e "const db = require('better-sqlite3')('ai-radar.db'); console.log(db.prepare('SELECT * FROM signals WHERE type = \'video\' LIMIT 1').get());"

```




```
node -e "fetch('http://localhost:3007/api/signals', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({category_id: 'all'})}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))"
```

