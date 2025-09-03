# MCP Server VSCode Development Integration

## Background & Problems

This is a derivative project from the [clusterize-quick-order-system](https://github.com/ihmcjacky/clusterize-quick-order-system), the creation of the quick ordering system frontend deployment requires an image served from gitlab docker registry, I need to first prepare a `docker pull` ready image for the deployment to pull with, and hence the CI / CD job failure encountered.

So the pain of debugging CI / CD yamls are clear, in the past I need to tag, push and read the log in pipelines displayed in `gitlab.com`. But now I have an idea of integrating AI in debugging of pipeline errors.

## Solutions

That's why I am thinking of MCP server integration in VSCode and AI agent, the largest pain point is that AI agent lacks abilities to access to 3rd party platform's context. Like my example, I would like AI debug assist for my pipeline failure

```
... skip 

#12 16.80 npm warn deprecated @humanwhocodes/config-array@0.5.0: Use @eslint/config-array instead
#12 17.11 npm warn deprecated babel-eslint@10.1.0: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.
#12 17.17 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
#12 17.23 npm warn deprecated eslint@7.32.0: This version is no longer supported. Please see https://eslint.org/version-support for other options.
#12 22.01 
#12 22.01 added 1844 packages in 22s
#12 22.01 
#12 22.01 215 packages are looking for funding
#12 22.01   run `npm fund` for details
#12 DONE 22.5s
#13 [frontend build 7/8] COPY src /usr/quick-order-system/src
#13 DONE 0.1s
#14 [frontend build 8/8] RUN npm run build
#14 0.192 
#14 0.192 > quick-ordering-system@1.1.8 build
#14 0.192 > react-scripts build
#14 0.192 
#14 0.841 (node:24) [DEP0176] DeprecationWarning: fs.F_OK is deprecated, use fs.constants.F_OK instead
#14 0.841 (Use `node --trace-deprecation ...` to show where the warning was created)
#14 0.867 Creating an optimized production build...
time="2025-09-03T07:09:40Z" level=warning msg="buildx: git was not found in the system. Current commit information was not captured by the build"
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
#14 2.084 Failed to compile.
#14 2.084 
#14 2.084 Module not found: Error: Can't resolve 'misc/lng' in '/usr/quick-order-system/src'
#14 2.084 Did you mean './misc/lng'?
#14 2.084 Requests that should resolve in the current directory need to start with './'.
#14 2.084 Requests that start with a name are treated as module requests and resolve within module directories (node_modules, /usr/quick-order-system/node_modules).
#14 2.084 If changing the source code is not an option there is also a resolve options called 'preferRelative' which tries to resolve these kind of requests in the current directory too.
#14 2.084 
#14 2.084 
#14 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [frontend build 8/8] RUN npm run build:
0.867 Creating an optimized production build...
2.084 Failed to compile.
2.084 
2.084 Module not found: Error: Can't resolve 'misc/lng' in '/usr/quick-order-system/src'
2.084 Did you mean './misc/lng'?
2.084 Requests that should resolve in the current directory need to start with './'.
2.084 Requests that start with a name are treated as module requests and resolve within module directories (node_modules, /usr/quick-order-system/node_modules).
2.084 If changing the source code is not an option there is also a resolve options called 'preferRelative' which tries to resolve these kind of requests in the current directory too.
2.084 
2.084 
------
Cleaning up project directory and file based variables
00:01
ERROR: Job failed: exit code 17
```

The bug is related to path issues on 1 of my software engineer, who import modules with paths without adding `./` relative path. In normal debugging situation, I would think a grep command, retrieve all the incorrect import lines and replace them, re-tag, push again and observe the results again and repeat the whole thing.

## MCP server in place

But then I think of two MCP server which when setup can efficiently solve this situation. One is gitlab MCP server, the other is VSCode MCP server. The gitlab MCP server can be setup to listen to the pipeline logs and trigger the AI agent to analyze the logs and provide debugging assist. The VSCode MCP server can be setup to listen to the local development environment and trigger the AI agent to analyze the code and provide debugging assist. Setting up MCP server is not difficult, but the challenge comes to how you can integrate the AI agent and provide the right prompt at the right time.

### Gitlab MCP server setup

Prerequisite thing is npx, ensure it is setup before that. Then instal with `Add remote MCP`. This is a bit tricky since you need to provide access authroization, so do not use local MCP server installation. After inputting the remote MCP URL and name, O2 auth comes up and browser would pop up with the authentication request to allow Gitlab MCP server to response information related to your logged in git repositories. The resulting MCP json file is as follows.

```json
{
  "mcpServers": {
    "Gitlab": {
      "url": "https://gitlab.com/api/v4/mcp",
      "type": "http"
    }
  }
}
```

This provide AI to get access to the pipeline information and now I can ask with the following prompt

### The prompt

```
The pipeline appears to be related to an incorrect file path for the docker-compose-prod.yml file in the pipeline configuration. Please:

1. Use the GitLab MCP tools to access the latest pipeline run and retrieve the detailed error logs from the failed job(s)
2. Identify the specific error message related to the docker-compose-prod.yml file path
3. Compare the file path used in the .gitlab-ci.yml script commands with the actual location of the docker-compose-prod.yml file in the repository structure
4. Correct the file path in the .gitlab-ci.yml configuration to match the actual file location
5. Provide the exact changes needed to fix the path issue

Focus specifically on the docker-compose file path error and provide the corrected script section for the .gitlab-ci.yml file. Finally explain why such error happens and suggest me with best practise when handling these kind of path related issue
```

With the assist of Gitlab MCP server, the AI code assist can retrieve the pipeline job's message and grep all the import path errors.

## References
- `src/App.jsx` Provision of the problematic source which includes relative path related errors causing pipeline failure.
- `src/mcpServer.config.json` The MCP server configuration file for VSCode to access Gitlab MCP server.