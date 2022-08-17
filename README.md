# Sudoswap
Subgraph to index sudoswap.xyz contract events and stats

To build:  
- `yarn init --yes`
- `yarn add @graphprotocol/graph-cli`
- `yarn codegen`
- `yarn build`
- `graph auth https://api.thegraph.com/deploy/ {deployKey}`
- `graph deploy --product hosted-service {username}/Sudoswap`