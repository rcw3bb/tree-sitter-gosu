# Python >=3.14 base image with build-essential (GCC) for the native tree-sitter extension.
FROM mcr.microsoft.com/devcontainers/python:3.14

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends build-essential \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Poetry 2.2, pinned to match project requirements. Installed under POETRY_HOME
# (not /root/.local) and symlinked into /usr/local/bin so the non-root vscode
# user, which actually runs postCreateCommand/terminals, can execute it too.
ENV POETRY_VERSION=2.2.0
ENV POETRY_HOME=/opt/poetry
RUN curl -sSL https://install.python-poetry.org | python3 - --version ${POETRY_VERSION} \
    && ln -s ${POETRY_HOME}/bin/poetry /usr/local/bin/poetry
