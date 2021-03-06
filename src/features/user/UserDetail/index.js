import React, { Component } from "react"
import { connect } from "react-redux"
import { compose } from "redux"
import { toastr } from "react-redux-toastr"
import { firestoreConnect, isEmpty } from "react-redux-firebase"
import { Grid } from "semantic-ui-react"

import LoadingSpinner from "../../../app/layout/LoadingSpinner"
import UserDetailHeader from "./UserDetailHeader"
import UserDetailDescription from "./UserDetailDescription"
import { userDetailQuery } from "../userDetailQuery"
import { getUserEvents, followUser, unfollowUser } from "../userActions"

class UserDetailedPage extends Component {
  async componentDidMount() {
    const { firestore, match, getUserEvents, userUid } = this.props

    let user = await firestore.get(`users/${match.params.id}`)
    if (!user.exists) {
      toastr.error("Not found", "This is not the user you're looking for")
      this.props.history.push("/error")
    }

    await getUserEvents(userUid)
  }

  changeTab = (e, { activeIndex }) => {
    const { getUserEvents, userUid } = this.props
    getUserEvents(userUid, activeIndex)
  }

  render() {
    const { profile, match, requesting } = this.props

    const isLoading = requesting[`users/${match.params.id}`]

    if (isLoading) return <LoadingSpinner inverted={true} />

    return (
      <Grid>
        <UserDetailHeader profile={profile} />
        <UserDetailDescription profile={profile} />
      </Grid>
    )
  }
}

const mapStateToProps = (
  { auth, firebase, firestore, events, async },
  { match }
) => {
  let userUid = null
  let profile = {}

  if (match.params.id === auth.uid) {
    profile = firebase.profile
  } else {
    profile =
      !isEmpty(firestore.ordered.profile) && firestore.ordered.profile[0]
    userUid = match.params.id
  }

  return {
    profile,
    userUid,
    events,
    eventsLoading: async.loading,
    auth: firebase.auth,
    photos: firestore.ordered.photos,
    requesting: firestore.status.requesting,
    following: firestore.ordered.following
  }
}

export default compose(
  connect(
    mapStateToProps,
    { getUserEvents, followUser, unfollowUser }
  ),
  firestoreConnect(props => userDetailQuery(props))
)(UserDetailedPage)
