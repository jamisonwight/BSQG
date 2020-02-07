import React from 'react'
import $ from 'jquery'
import moment from 'moment'
import {messagePipeline} from '../../utilities'

export default class Comment extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            comments: [],
            comment: '',
            commentsEmpty: true
        }

        this.displayComments = this.displayComments.bind(this)
        this.getComments = this.getComments.bind(this)
        this.createComment = this.createComment.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.messagePipeline = messagePipeline.bind(this)
        this.displayGifs = this.displayGifs.bind(this)
    }

    componentDidMount() {
        let $this = this,
            comments = []

        // Get database data for comment sub-collections
        this.props.firebase
        .firestore()
        .collection("board")
        .doc($this.props.parentid)
        .collection('comments')
        .orderBy('date', 'asc')
        .onSnapshot(snapshot => {
            if (this.state.comments.length !== 0) {
                snapshot.docChanges().forEach(change => {
                    // Comment Added
                    if (change.type === "added") {
                      var data = change.doc.data()
                      // Add Comment ID
                      data['id'] = change.doc.id
                      comments.push(data)
                    }
                    // Removed
                    if (change.type === "removed") {
                      var removed = comments.filter(comment => comment.id !== change.doc.id)
                      comments = removed
                    }
                  })
            } else if (this.state.comments.length === 0) {
                snapshot.forEach(doc => {
                    var data = doc.data()
                    // Add Post ID
                    data['id'] = doc.id
                    comments.push(data)
                })
                $this.setState({commentsEmpty: false})
            }
            $this.setState({comments: comments})
        }) 
    }

    displayGifs() {
        // var gifElement = document.querySelectorAll('.gif-message')
        // gifElement.forEach((image, index) => {
        //     var img = image
        //     image.setAttribute('crossOrigin', '')
        //     var gif = new GIF({
        //         workers: 2,
        //         quality: 10
        //     })
        //     gif.addFrame(image)
        //     gif.render()

        // }) 
    }

    displayComments() {
        return (
            <div>
                {
                    !this.state.commentsEmpty
                    ? this.state.comments.map((comment) =>
                        <div className="board__comment">
                            <div className="board__comment_profile">
                                <img src={comment.avatar} alt="Avatar thumbnail" width="24" height="24" />
                                <span className="username">{comment.username}</span>
                            </div>
                            <div className="board__comment_body">
                                {
                                    comment.isgiphy
                                    ? <img src={comment.giphy} class="gif-message" width="300" height="300"/>
                                    : <p>{comment.message}</p>
                                
                                }
                                <small>{moment(comment.commentCreated).format('MMMM Do YYYY, h:mm a')}</small>
                            </div>
                        </div>
                    )
                    : 'Be the first one to reply ;)'
                }
            </div>
        )
    }

    // Get all comments for a single post
    getComments(parentid) {
        
    }

    // Create a new board comment
    createComment(e, parentid, commentid) {
        e.preventDefault()

        // Run message pipeline to check for special string commands
        // Example: /giphy
        let messagePipeline = this.messagePipeline(this.state.comment)
        
        const $this = this,
              formData = {
                parentid: parentid,
                commentid: commentid,
                message: this.state.comment,
                uid: this.props.user.uid,
                username: this.props.user.displayName,
                avatar: this.props.user.photoURL,
                gifkeyword: messagePipeline.giphyTag,
                isgiphy: messagePipeline.isGiphy,
            }

            console.log(formData)

            if (this.props.isVerified) {
                $.ajax({
                    contentType: 'application/json',
                    url: "http://localhost:3000/board/comment/create",
                    type: "POST",
                    data: JSON.stringify(formData),
                });
            }
            this.setState({comment: ''})
    }


    handleChange(e) {
        this.setState({comment: e.target.value})
        e.preventDefault()
        return false
    }


    render() {
        return (
            <div className="comments-container">
                {/* Display all comments */}

                {this.displayComments()}

                {/* Comments Form */}
                <form onSubmit={(e) => {this.createComment(e, this.props.parentid, this.props.commentid)}} method="post">
                    <textarea name="comment" value={this.state.comment} onChange={this.handleChange} placeholder="Type message..."></textarea> 
                    <input type="submit" value="Send" />
                </form>
            </div>
        )
    }


}


