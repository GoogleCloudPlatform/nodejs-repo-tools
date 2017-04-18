# Select the container builder
FROM gcr.io/{{project}}/{{builder}}

# Load the source code
COPY . /{{src}}/

WORKDIR /{{src}}
