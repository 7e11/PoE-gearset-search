@echo off

@REM Need to do `yarn build` before this.
@REM Also do npm install on server

set server_ip=107.22.52.131
set public_key=C:\Users\Evan.Evan-Desktop\.ssh\LightsailDefaultKey-us-east-1.pem
echo Deploying to %server_ip%
@REM Copy over static files after they're built in the client folder.
scp -r -i %public_key% ..\client\dist bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/dist
@REM Copy over config files
@REM set config_files=package.json package-lock.json
scp -r -i %public_key% .\package.json bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\package-lock.json bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\yarn.lock bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/

scp -r -i %public_key% .\.browserslistrc bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\.eslintrc.js bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\babel.config.js bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\tsconfig.json bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/

@REM @REM Copy over typescript files
@REM set ts_files=server.ts solver.ts types.ts
scp -r -i %public_key% .\src\server.ts bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\src\solver.ts bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\src\types.ts bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/
scp -r -i %public_key% .\src\database.ts bitnami@%server_ip%:/home/bitnami/projects/poe-searcher-vue/

@REM Open an ssh terminal
@REM yarn install
@REM tsc
@REM node out/server.js
@REM Also, I have the shared credential file configured on the instance.
