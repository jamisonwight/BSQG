package board

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

type BoardPost struct {
	PostID   string `json:"postid" binding:"required"`
	UID      string `json:"uid" binding:"required"`
	Username string `json:"username" binding:"required"`
	Message  string `json:"message" binding:"required"`
	Avatar   string `json:"avatar" binding:"required"`
}

var db *firestore.Client
var ctx context.Context
var err error

// CreatePosts : Create a new firestore for posts
func CreatePosts(g *gin.Context) {
	g.Header("Content-Type", "application/json")

	var json BoardPost
	g.BindJSON(&json)

	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("./serviceAccountKey.json"))
	if err != nil {
		fmt.Errorf("error getting Auth client: %v", err)
		panic(err)
	}

	// Firebase database
	db, err := app.Firestore(context.Background())
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	boardDB := db.Collection("board")

	_, _, err = boardDB.Add(g, map[string]interface{}{
		"uid":      json.UID,
		"postid":   json.PostID,
		"username": json.Username,
		"message":  json.Message,
		"avatar":   json.Avatar,
	})
	if err != nil {
		log.Fatalf("Failed adding alovelace: %v", err)
	}

	fmt.Println(json)
}
