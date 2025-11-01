# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated deployment to Google Cloud Run.

## Workflows

### Frontend Deployment
- **File**: `workflows/deploy-frontend.yml`
- **Triggers**: Push to main branch with changes in `frontend/**`
- **Manual**: Can be triggered from Actions tab
- **Deploys**: Frontend to Cloud Run (us-west1)

### Backend Deployment
- **File**: `workflows/deploy-backend.yml`
- **Triggers**: Push to main branch with changes in `backend/**`
- **Manual**: Can be triggered from Actions tab
- **Deploys**: Backend to Cloud Run (us-west1)

## Requirements

- `GCP_SA_KEY` secret must be configured in repository settings
- Service account must have Cloud Run Admin and Service Account User roles

## Testing

To test the workflows:
1. Go to the Actions tab in GitHub
2. Select the workflow you want to run
3. Click "Run workflow" → "Run workflow"
4. Monitor the deployment progress

## Automated Deployments

Changes pushed to the main branch will automatically trigger deployments:
- Changes in `frontend/**` → Deploy frontend
- Changes in `backend/**` → Deploy backend
