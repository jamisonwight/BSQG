package board

import (
	"context"
	"fmt"
	"giphy"
	"log"
	"time"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

type BoardComment struct {
	UID        string `json:"uid" binding:"required"`
	ParentID   string `json:"parentid" binding:"required"`
	CommentID  int    `json:"commentid" binding:"required"`
	Username   string `json:"username" binding:"required"`
	Message    string `json:"message" binding:"required"`
	Avatar     string `json:"avatar" binding:"required"`
	GifKeyword string `json:"gifkeyword" binding:"required"`
	IsGiphy    bool   `json:"isgiphy" binding:"required"`
}

// CreateComment : Create a new firestore for post comments
func CreateComment(g *gin.Context) {
	g.Header("Content-Type", "application/json")

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

	// Board database
	boardDB := db.Collection("board")

	var json BoardComment
	g.BindJSON(&json)

	// Check for giphy
	var giphyURL string
	giphyURL = giphy.GetRandom(json.GifKeyword)

	// Get current time
	time := time.Now()

	_, _, err = boardDB.Doc(json.ParentID).Collection("comments").Add(g, map[string]interface{}{
		"uid":        json.UID,
		"parentid":   json.ParentID,
		"commentid":  json.CommentID,
		"username":   json.Username,
		"message":    json.Message,
		"avatar":     json.Avatar,
		"isgiphy":    json.IsGiphy,
		"gifkeyword": json.GifKeyword,
		"giphy":      giphyURL,
		"date":       time.Format("Jan _2 15:04:05"),
	})
	if err != nil {
		// Handle any errors in an appropriate way, such as returning them.
		log.Printf("An error has occurred: %s", err)
	}

	fmt.Println(json.GifKeyword)
	fmt.Println(giphyURL)
	fmt.Println(json)
}
