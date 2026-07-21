#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "${DEPLOY_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

HARBOR_REGISTRY="${HARBOR_REGISTRY:-mpoc-test-harbor.xgd.com}"
HARBOR_PROJECT="${HARBOR_PROJECT:-xjc}"
IMAGE_NAME="${IMAGE_NAME:-outline}"
LOCAL_IMAGE="${LOCAL_IMAGE:-}"
IMAGE_TAG="${IMAGE_TAG:-${TAG:-}}"
PUSH_LATEST="${PUSH_LATEST:-true}"

usage() {
  cat <<'EOF'
Usage: deploy/push-harbor.sh [options]

Options:
  -t, --tag TAG                 Local image tag to push. Defaults to latest.
      --registry REGISTRY       Harbor registry. Defaults to mpoc-test-harbor.xgd.com.
      --project PROJECT         Harbor project. Defaults to xjc.
      --image-name NAME         Remote image name. Defaults to outline.
      --local-image IMAGE       Local image name. Defaults to image name.
      --latest                  Also push the latest tag. Default.
      --no-latest               Do not push the latest tag.
  -h, --help                    Show this help.

Set HARBOR_USERNAME and HARBOR_PASSWORD to log in non-interactively.
Environment variables with the same names are still supported.
CLI options override environment variables.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    -t|--tag)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --tag" >&2
        exit 1
      fi
      IMAGE_TAG="$1"
      ;;
    --tag=*)
      IMAGE_TAG="${1#*=}"
      ;;
    --registry)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --registry" >&2
        exit 1
      fi
      HARBOR_REGISTRY="$1"
      ;;
    --registry=*)
      HARBOR_REGISTRY="${1#*=}"
      ;;
    --project)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --project" >&2
        exit 1
      fi
      HARBOR_PROJECT="$1"
      ;;
    --project=*)
      HARBOR_PROJECT="${1#*=}"
      ;;
    --image-name)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --image-name" >&2
        exit 1
      fi
      IMAGE_NAME="$1"
      ;;
    --image-name=*)
      IMAGE_NAME="${1#*=}"
      ;;
    --local-image)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --local-image" >&2
        exit 1
      fi
      LOCAL_IMAGE="$1"
      ;;
    --local-image=*)
      LOCAL_IMAGE="${1#*=}"
      ;;
    --latest)
      PUSH_LATEST="true"
      ;;
    --no-latest)
      PUSH_LATEST="false"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [ -z "${LOCAL_IMAGE}" ]; then
  LOCAL_IMAGE="${IMAGE_NAME}"
fi

if [ -z "${IMAGE_TAG}" ]; then
  IMAGE_TAG="latest"
fi

LOCAL_IMAGE_REF="${LOCAL_IMAGE}:${IMAGE_TAG}"
REMOTE_IMAGE="${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${IMAGE_NAME}"

docker image inspect "${LOCAL_IMAGE_REF}" >/dev/null

if [ -n "${HARBOR_USERNAME:-}" ]; then
  if [ -n "${HARBOR_PASSWORD:-}" ]; then
    printf '%s' "${HARBOR_PASSWORD}" | docker login "${HARBOR_REGISTRY}" -u "${HARBOR_USERNAME}" --password-stdin
  else
    docker login "${HARBOR_REGISTRY}" -u "${HARBOR_USERNAME}"
  fi
else
  echo "HARBOR_USERNAME is not set; using existing Docker login session"
fi

echo "Tagging ${LOCAL_IMAGE_REF} as ${REMOTE_IMAGE}:${IMAGE_TAG}"
docker tag "${LOCAL_IMAGE_REF}" "${REMOTE_IMAGE}:${IMAGE_TAG}"

echo "Pushing ${REMOTE_IMAGE}:${IMAGE_TAG}"
docker push "${REMOTE_IMAGE}:${IMAGE_TAG}"

if [ "${PUSH_LATEST}" = "true" ] && [ "${IMAGE_TAG}" != "latest" ]; then
  echo "Tagging ${LOCAL_IMAGE_REF} as ${REMOTE_IMAGE}:latest"
  docker tag "${LOCAL_IMAGE_REF}" "${REMOTE_IMAGE}:latest"

  echo "Pushing ${REMOTE_IMAGE}:latest"
  docker push "${REMOTE_IMAGE}:latest"
fi
