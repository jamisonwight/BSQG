package main

type VerifyStruct struct {
	Token string `json:"idToken" binding:"required"`
}
