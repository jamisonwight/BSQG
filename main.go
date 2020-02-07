package main

import (
	"bsqg/board"
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var clientAuth *auth.Client
var clientStore *firestore.Client
var ctx context.Context

func main() {
	var err error
	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("./serviceAccountKey.json"))

	if err != nil {
		fmt.Errorf("error getting Auth client: %v", err)
		panic(err)
	}

	// Firebase Auth
	clientAuth, err = app.Auth(context.Background())
	if err != nil {
		fmt.Errorf("error getting Auth client: %v", err)
		panic(err)
	}

	// iter := clientStore.Collection("board").Documents(context.Background())
	// for {
	// 	doc, err := iter.Next()
	// 	if err == iterator.Done {
	// 		break
	// 	}
	// 	if err != nil {
	// 		log.Fatalf("Failed to iterate: %v", err)
	// 	}
	// 	fmt.Println(doc.Data())
	// }

	// Set the router as the default one shipped with Gin
	router := gin.Default()

	// Verify Token
	router.POST("/verify", verify)

	// Board
	router.POST("/board/create", board.CreatePosts)
	router.POST("/board/comment/create", board.CreateComment)

	router.GET("/ws", func(c *gin.Context) {
		wshandler(c.Writer, c.Request)
	})

	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("./frontend/bsqg/build", true)))

	router.Run(":3000")
}

func verify(c *gin.Context) {
	c.Header("Content-Type", "application/json")

	var json VerifyStruct
	c.BindJSON(&json)

	token, err := clientAuth.VerifyIDToken(c, json.Token)
	if err != nil {
		log.Fatalf("error verifying ID token: %v\n", err)
	}
	log.Printf("Verified ID token: %v\n", token)
	c.JSON(200, true)
	if err != nil {
		return
	}
}
