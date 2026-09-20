package web

import "embed"

// Files contains all embedded static assets and HTML templates.
//
//go:embed static/* templates/*
var Files embed.FS
