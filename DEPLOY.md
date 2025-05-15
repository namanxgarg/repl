# Deployment Guide

## Prerequisites
- Kubernetes cluster (e.g., GKE, EKS, or Minikube)
- kubectl configured
- Docker installed
- MongoDB Atlas account (or self-hosted MongoDB)

## Deployment Steps

1. **Create Kubernetes Secrets**
```bash
# Create MongoDB secret
kubectl create secret generic mongodb-secret \
  --from-literal=uri='mongodb+srv://<username>:<password>@<cluster>.mongodb.net/replit-clone'

# Create Redis secret (if using Redis)
kubectl create secret generic redis-secret \
  --from-literal=uri='redis://<host>:<port>'
```

2. **Build and Push Docker Images**
```bash
# Build the base image
docker build -t replit-clone-base:latest ./runner

# Tag and push to your container registry
docker tag replit-clone-base:latest <your-registry>/replit-clone:latest
docker push <your-registry>/replit-clone:latest
```

3. **Deploy to Kubernetes**
```bash
# Apply the Kubernetes configurations
kubectl apply -f k8s/deployment.yaml

# Verify deployment
kubectl get pods
kubectl get services
```

4. **Access the Application**
```bash
# Get the external IP
kubectl get service replit-clone-service
```

## Monitoring

1. **View Logs**
```bash
# View pod logs
kubectl logs -f deployment/replit-clone

# View specific pod logs
kubectl logs -f <pod-name>
```

2. **Monitor Scaling**
```bash
# Check HPA status
kubectl get hpa

# Check pod metrics
kubectl top pods
```

## Troubleshooting

1. **Check Pod Status**
```bash
kubectl describe pod <pod-name>
```

2. **Check Service Status**
```bash
kubectl describe service replit-clone-service
```

3. **Check Events**
```bash
kubectl get events --sort-by='.lastTimestamp'
```

## Scaling

The application automatically scales based on CPU and memory usage:
- CPU threshold: 70%
- Memory threshold: 80%
- Min replicas: 3
- Max replicas: 10

To manually scale:
```bash
kubectl scale deployment replit-clone --replicas=5
``` 