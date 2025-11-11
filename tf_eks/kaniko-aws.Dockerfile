FROM gcr.io/kaniko-project/executor:debug

# Switch to UID 0 instead of username root
USER 0

# Install basic tools and AWS CLI
RUN apk add --no-cache bash curl python3 py3-pip && \
    pip3 install awscli && \
    ln -sf /bin/bash /bin/sh

# Verify installations
RUN bash -c "aws --version && /kaniko/executor version"
