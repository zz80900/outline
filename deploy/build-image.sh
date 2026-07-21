#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "${DEPLOY_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

IMAGE_NAME="${IMAGE_NAME:-outline}"
LOCAL_IMAGE="${LOCAL_IMAGE:-}"
LOCAL_BASE_IMAGE="${LOCAL_BASE_IMAGE:-}"
IMAGE_TAG="${IMAGE_TAG:-${TAG:-}}"
CDN_URL="${CDN_URL:-}"
PULL_BASE_IMAGE="${PULL_BASE_IMAGE:-true}"
TAG_LATEST="${TAG_LATEST:-true}"

usage() {
  cat <<'EOF'
Usage: deploy/build-image.sh [options]

Options:
  -t, --tag TAG                 Image tag. Defaults to yyMMddHHmm.
      --image-name NAME         Image name. Defaults to outline.
      --local-image IMAGE       Local runtime image. Defaults to image name.
      --local-base-image IMAGE  Local build image. Defaults to <local-image>-base.
      --cdn-url URL             CDN URL passed to the frontend build.
      --pull                    Pull the base Node image before building. Default.
      --no-pull                 Do not pull the base Node image before building.
      --latest                  Also tag the runtime image as latest. Default.
      --no-latest               Do not tag the runtime image as latest.
  -h, --help                    Show this help.

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
    --local-base-image)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --local-base-image" >&2
        exit 1
      fi
      LOCAL_BASE_IMAGE="$1"
      ;;
    --local-base-image=*)
      LOCAL_BASE_IMAGE="${1#*=}"
      ;;
    --cdn-url)
      shift
      if [ "$#" -eq 0 ]; then
        echo "Missing value for --cdn-url" >&2
        exit 1
      fi
      CDN_URL="$1"
      ;;
    --cdn-url=*)
      CDN_URL="${1#*=}"
      ;;
    --pull)
      PULL_BASE_IMAGE="true"
      ;;
    --no-pull)
      PULL_BASE_IMAGE="false"
      ;;
    --latest)
      TAG_LATEST="true"
      ;;
    --no-latest)
      TAG_LATEST="false"
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

if [ -z "${LOCAL_BASE_IMAGE}" ]; then
  LOCAL_BASE_IMAGE="${LOCAL_IMAGE}-base"
fi

if [ -z "${IMAGE_TAG}" ]; then
  IMAGE_TAG="$(date +%y%m%d%H%M)"
fi

BASE_IMAGE_REF="${LOCAL_BASE_IMAGE}:${IMAGE_TAG}"
RUNTIME_IMAGE_REF="${LOCAL_IMAGE}:${IMAGE_TAG}"

base_build_args=(
  "build"
  "--build-arg" "CDN_URL=${CDN_URL}"
  "-f" "Dockerfile.base"
  "-t" "${BASE_IMAGE_REF}"
)

if [ "${PULL_BASE_IMAGE}" = "true" ]; then
  base_build_args+=("--pull")
fi

base_build_args+=(".")

echo "Building source image ${BASE_IMAGE_REF}"
docker "${base_build_args[@]}"

runtime_build_args=(
  "build"
  "--build-arg" "BASE_IMAGE=${BASE_IMAGE_REF}"
  "-f" "Dockerfile"
  "-t" "${RUNTIME_IMAGE_REF}"
)

if [ "${TAG_LATEST}" = "true" ]; then
  runtime_build_args+=("-t" "${LOCAL_IMAGE}:latest")
fi

runtime_build_args+=(".")

echo "Building runtime image ${RUNTIME_IMAGE_REF}"
docker "${runtime_build_args[@]}"

if [ "${TAG_LATEST}" = "true" ]; then
  echo "Built ${RUNTIME_IMAGE_REF} and ${LOCAL_IMAGE}:latest"
else
  echo "Built ${RUNTIME_IMAGE_REF}"
fi
