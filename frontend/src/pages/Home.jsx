import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import moment from "moment";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Toast from "../components/Toast";
import EmptyCard from "../components/EmptyCard";

Modal.setAppElement("#root");

const Home = () => {
  const [openAddEditModal, setAddOpenEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMessage, setShowToastMessage] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setAddOpenEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMsg = (message, type) => {
    setShowToastMessage({
      isShown: true,
      message,
      type,
    });
  };
  const handleCloseToast = () => {
    setShowToastMessage({
      isShown: false,
      message: "",
    });
  };
  //Get info of user
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An error occured");
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`);
      if (response.data && !response.data.error) {
        showToastMsg("Note Deleted Successfully", "delete");
        setAllNotes(allNotes.filter((note) => note._id !== noteId));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      showToastMsg("Failed to delete the note. Please try again.", "delete");
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes/", {
        params: { query },
      });


      if (response.data && response.data.notes) {
        setIsSearch(true)
        setAllNotes(response.data.notes)
      }
    } catch (error) {
      console.error("Error searching notes:", error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id; 
    try {
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
        "isPinned": !noteId.isPinned ,
      });
      if (response.data && response.data.note) {
        showToastMsg("Note Pinned Successfully")
        getAllNotes(); // Refresh the notes list
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes()
  }

  useEffect(() => {
    getUserInfo();
    getAllNotes();
    return () => {};
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item, index) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={moment(item.createdOn).format("Do MMM YYYY")}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => {updateIsPinned(item)}}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            onAddNote={() =>
              setAddOpenEditModal({ isShown: true, type: "add", data: null })
            }
          />
        )}
      </div>
      <button
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setAddOpenEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setAddOpenEditModal({ ...openAddEditModal, isShown: false })
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2",
          },
        }}
        contentLabel="Add/Edit Notes Modal"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-hidden"
      >
        <AddEditNotes
          getAllNotes={getAllNotes}
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setAddOpenEditModal({ isShown: false, type: "add", data: null });
          }}
          showToastMsg={showToastMsg}
        />
      </Modal>
      <Toast
        isShown={showToastMessage.isShown}
        message={showToastMessage.message}
        type={showToastMessage.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
