# Backend-only image: builds and runs the Go blockchain/API/WebSocket
# server. Deploy this to a host that supports a long-running process with
# persistent in-memory state and WebSockets (Railway, Render, Fly.io, a VPS)
# — NOT Vercel, whose serverless functions are stateless and time-limited
# and can't host this app's background PoW miner or live telemetry hub.
#
# The frontend is a separate static build (see frontend/vercel.json) and is
# not built here; this image serves only /api/* and /ws. It still embeds
# whatever is currently committed under web/templates as a same-origin
# fallback page, but a split deploy serves the real frontend from Vercel.

FROM golang:1.27-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /blockvote ./cmd/blockvote

FROM alpine:3.20
WORKDIR /app
COPY --from=build /blockvote ./blockvote

# Railway/Render/Fly all inject $PORT; main.go reads it automatically.
ENV PORT=8080
EXPOSE 8080

CMD ["./blockvote"]
