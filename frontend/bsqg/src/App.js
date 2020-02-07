import React, {Component} from 'react'
import $ from 'jquery'
import Home from './components/Home'
import Board from './components/Board/Board.js'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'
import {
  FirebaseAuthProvider,
  FirebaseAuthConsumer,
} from "@react-firebase/auth"

// SASS
import './styles.scss'

// Init Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig)

// Database
const db = firebase.firestore()


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVerified: false,
      error: false,
      posts: []
    }
    this.verifyAuthToken = this.verifyAuthToken.bind(this)
    this.getPosts = this.getPosts.bind(this)
    this.wsHandler = this.wsHandler.bind(this)
  }


  getPosts() {
    const $this = this

    var updatedPosts = []

    db.collection("board")
      .onSnapshot(snapshot => {
        if (this.state.posts.length !== 0) {
          snapshot.docChanges().forEach(change => {
            // Added
            if (change.type === "added") {
              var data = change.doc.data()
              // Add Post ID
              data['postId'] = change.doc.id
              updatedPosts.push(data)
            }
            // Removed
            if (change.type === "removed") {
              var removed = updatedPosts.filter(post => post !== change.doc.data())
              updatedPosts = removed
            }
          })
        } else if (this.state.posts.length === 0) {
          snapshot.forEach(doc => {
            var data = doc.data()
            // Add Post ID
            data['postId'] = doc.id
            updatedPosts.push(data)
          })
        }
        $this.setState({posts: updatedPosts})
      })
  }

  verifyAuthToken() {
    var $this = this
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ false).then(function(idToken) {
      // Send token to your backend via HTTPS
      if (!$this.state.isVerified) {
        $.ajax({
          contentType: 'application/json',
          url: "http://localhost:3000/verify",
          type: "POST",
          data: JSON.stringify({idToken: idToken}),
          dataType: "json",
          success: function(data) {
            $this.setState({isVerified: true})

            if (data === true) {
              $this.setState({error: false})
            } else {
              $this.setState({error: true})
            }
            $this.getPosts()
          },
          complete: function(data) {
        
          }
        });
      }
    })
    .catch(function(error) {
      // Handle error
      console.log(error)
    });
  }

  wsHandler() {
    var url = 'ws://localhost:3000/ws',
        c = new WebSocket(url)
      
    var send = function(data){
      c.send(data)
    }

    c.onmessage = function(msg) {
      // console.log(msg)
    }

    c.onopen = function(){
      setInterval( 
        function(){ send("ping") }
      , 1000 )
    }
  }

  render() {

    return (
      <div className="App">
        <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
          {
            <FirebaseAuthConsumer>
              {({ isSignedIn, user, providerId } = this.props) => {
                return (
                  <div className="container">
                    <h1> BSQG </h1>
                    <h4> Not Just Any Group</h4>

                    {/* Verify User */}
                    { isSignedIn ? this.verifyAuthToken() : null }

                    {/* Test Websockets */}
                    { isSignedIn ? this.wsHandler() : null }

                    {/* Check Verification */
                      this.state.isVerified
                        // Peeny Board
                        ? 
                        <Board 
                          user={user} 
                          {...this.props} 
                          isVerified={this.state.isVerified}
                          posts={this.state.posts}
                          db={this.state.db}
                          firebase={firebase}
                        />
                        
                        // Sign in
                        : <button 
                          onClick={() => {
                              const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
                              firebase.auth().signInWithPopup(googleAuthProvider); 
                          }}
                        >Sign In With Google</button>
                    }

                    {/* Error Message */}
                    {this.state.error ? <p class="errorMessage">Sorry, we could not verify your account.</p> : null}
                  </div>
                )
              }}
            </FirebaseAuthConsumer>
          }
        </FirebaseAuthProvider>
      </div>
    );
  }
}

const firebaseAppAuth = firebaseApp.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider()
}

export default App
