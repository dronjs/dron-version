Increases current package Npm version

# Usage

Install Dron CLI:
```terminal
npm i dron-cli -g
```

Get current version:
```terminal
dron version
```

Increase build version (1.0.+):
```terminal
dron version +
```

Increase minor version (1.+.0):
```terminal
dron version ++
```

Increase major version (+.0.0):
```terminal
dron version +++
```

Add literals:
```terminal
dron version +rc
```
Will make 1.0.1rc

# License
MIT, 2016

# Author
Vladimir Kalmykov <vladimirmorulus@gmail.com>
