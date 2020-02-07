import React from 'react'
import $ from 'jquery'
import Comment from './components/Comment'

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            message: '',
        }
        this.props = {
            isToggle: false,
            comments: []
        }

        this.messageInput = React.createRef()
        this.commentRef = React.createRef()

        this.getPosts = this.getPosts.bind(this)
        this.createPost = this.createPost.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.toggleComments = this.toggleComments.bind(this)
    }

    toggleComments(e, index, parentid) {
        e.preventDefault()
        const comment = document.getElementById('board-comment-' + index)
        comment.classList.toggle('hide')
    }

    getPosts() {
        return (
            this.props.posts.map((post, $index) =>
                <div className="board__message">
                    <div className="board__message__profile">
                        <img src={post.avatar} alt="Avatar thumbnail" width="24" height="24" />
                        <span className="username">{post.username}</span>
                    </div>
                    <div className="board__message__body">
                        <p>{post.message}</p>
                    </div>
                    <span class="board__action" onClick={(e) => {
                        this.toggleComments(e, $index, post.postId)
                    }}>Comment</span>

                    {/* Comment Container */}
                    <div className="board__comments hide" id={'board-comment-' + $index}>
                        <Comment 
                            key={$index}
                            parentid={post.postId} 
                            user={this.props.user}
                            firebase={this.props.firebase}
                            {...this.props} 
                        />
                    </div>
                </div>
            )
        )
    }

    createPost(e) {
        e.preventDefault()
        const $this = this,
              formData = {
                message: this.state.message,
                uid: this.props.user.uid,
                username: this.props.user.displayName,
                avatar: this.props.user.photoURL
            }

        if (this.props.isVerified) {
            $.ajax({
                contentType: 'application/json',
                url: "http://localhost:3000/board/create",
                type: "POST",
                data: JSON.stringify(formData),
                dataType: "json",
            });
        }
        this.setState({message: ''})
    }

    handleChange(e) {
        this.setState({message: e.target.value})
        e.preventDefault()
        return false
    }

    render() {
        return (
            <div className="container">
                 <form onSubmit={this.createPost} method="post">
                    <textarea name="message" value={this.state.message} onChange={this.handleChange} placeholder="Type message..."></textarea> 
                    <input type="submit" value="Send" />   
                </form>
                <div className="board">
                    <br />
                    <span className="pull-right"><a onClick={this.logout}>Log out</a></span>
                    <h2>Peeny Board</h2>
                </div>

                {/* put all posts here */}
                <div className="board__container">
                    {this.getPosts()}
                </div>
            </div>
        )
    }
}
export default Board;