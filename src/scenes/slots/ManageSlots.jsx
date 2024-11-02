import { useState, useEffect } from "react";
import { Box, Typography, Modal, Button, TextField } from "@mui/material";
import { Header } from "../../components";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const ManageSlots = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pod_id } = useParams();
  const colors = tokens(theme.palette.mode);
  const [slots, setSlots] = useState([]);
  const [pods, setPods] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState("");

  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
    fetchPods();
  }, []);
  const fetchPods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/pods/${pod_id}`, {});
      setPods(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };
  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/slots`, {
        params: {
          pod_id: pod_id,
        },
      });
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedSlot(clickInfo.event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSlot(null);
  };

  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.date);
  };

  const handleDelete = () => {
    setDeletingSlotId(selectedSlot.id);
    setIsDeleteModalOpen(true);
    handleCloseModal();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/slots/${deletingSlotId}`
      );
      if (response.status === 201) {
        toast.success("Slot deleted successfully");
        fetchSlots();
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("An error occurred while deleting slot");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingSlotId(null);
    }
  };

  const handleEdit = () => {
    setEditingSlot(selectedSlot);
    setEditingPrice(selectedSlot.extendedProps.price);
    setIsEditModalOpen(true);
    handleCloseModal();
  };

  const handleUpdatePrice = async () => {
    try {
      if (editingPrice < 50000) {
        toast.error("Price must be at least 50,000 VND");
        return;
      }

      const response = await axios.put(`${API_URL}/api/v1/slots/${editingSlot.extendedProps.slot_id}`, {
        price: editingPrice,
      });

      if (response.status === 200) {
        toast.success("Slot price updated successfully");
        fetchSlots();
        setIsEditModalOpen(false);
        setEditingPrice("");
        setEditingSlot(null);
      }
    } catch (error) {
      console.error("Error updating slot price:", error);
      toast.error("An error occurred while updating slot price");
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPrice("");
    setEditingSlot(null);
  };

  return (
    <Box m="20px">
     
      <Header
        title={
          <Box component="span">
            MANAGE SLOTS OF{" "}
            <Typography
              component="span"
              sx={{
                color: colors.greenAccent[500],
                fontWeight: "bold",
                display: "inline",
                fontSize: "30px",
              }}
            >
              {pods?.pod_name || ""}
            </Typography>
          </Box>
        }
        subtitle="View and manage booking slots"
        showBackButton={true} 
      />
      <Button
         variant="outlined"
         sx={{ ml: "auto" ,  
           color: colors.gray[100],
           
           borderColor: colors.gray[100],
           '&:hover': {
             borderColor: colors.greenAccent[500],
             color: colors.greenAccent[500],
           }}}
        onClick={() => navigate(`/web/pod/${pod_id}/slot`)}
      >
        Generate Slot for {pods.pod_name}
      </Button>
      <Box
        sx={{
          backgroundColor: "#1a1c23",
          borderRadius: "16px",
          padding: "20px",
          "& .fc": {
            fontFamily: "'Inter', sans-serif",
          },
          "& .fc-toolbar-title": {
            color: "ffff",
            fontSize: "1.5rem",
            fontWeight: 600,
          },
          "& .fc-button": {
            backgroundColor: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            "&:hover": {
              backgroundColor: colors.greenAccent[600],
            },
            "&:disabled": {
              backgroundColor: colors.greenAccent[700],
            },
            textTransform: "capitalize",
            fontWeight: 500,
            color: colors.primary[500],
          },

          "& .fc-day-today": {
            backgroundColor: "transparent !important",
          },
          "& .fc-event": {
            backgroundColor: `${colors.greenAccent[500]} !important`,
            borderColor: colors.greenAccent[500],
            opacity: "0.9 !important",
            color: "ffff",
            "&:hover": {
              backgroundColor: colors.greenAccent[600],
              cursor: "pointer",
            },
          },
          "& .fc-timegrid-slot": {
            height: "80px !important",
            borderColor: "#3f3f46",
          },
          "& .fc-col-header-cell": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
            padding: "12px",
            fontWeight: 500,
          },
          "& .fc-timegrid-axis": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
          },
          "& .fc-timegrid-slot-label": {
            backgroundColor: "#27272a",
            color: colors.gray[100],
          },
          "& .fc-daygrid-day-bg .fc-bg-event": {
            backgroundColor: `${colors.greenAccent[500]} !important`,
          },
          "& .fc-daygrid-day:hover": {
            cursor: "pointer",
            "& .fc-daygrid-day-bg .fc-bg-event": {
              opacity: "0.4 !important",
            },
          },
          
          "& .fc-scrollgrid": {
            borderColor: "#3f3f46",
          },
          "& .fc-scrollgrid td, & .fc-scrollgrid th": {
            borderColor: "#3f3f46",
          },
          "& .fc-highlight": {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
          },
          "& .fc-event-title": {
            color: colors.primary[500],
          },
          "& .fc-event-time": {
            color: colors.primary[500],
          },
          "& .fc-daygrid-day.fc-day-has-event .fc-daygrid-day-number": {
            background: colors.greenAccent[600],
            color: colors.primary[500],
            borderRadius: "50%",
            padding: "10px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            boxShadow: colors.greenAccent[600],
          },
          "& .fc-timegrid-event": {
            margin: "4px 0",
            borderRadius: "4px",
            height: "calc(100% - 8px) !important",
          },
          // "& .fc-event": {
          //   backgroundColor: colors.greenAccent[500],
          //   margin: "2px 0",
          //   padding: "4px",
          // },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          events={slots.map((slot) => ({
            id: slot.slot_id.toString(),
            title: "",
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            textColor: "#ffffff",
            extendedProps: {
              slot_id: slot.slot_id,
              price: slot.price,
              pod_id: slot.pod_id,
              is_available: slot.is_available,
              start_time: new Date(slot.start_time).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
              end_time: new Date(slot.end_time).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              customStyle: {
                margin: '4px 0',
                borderRadius: '4px',
                padding: '4px'
              }
            },
          }))}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          height="650px"
          eventMinHeight={60}
          views={{
            timeGridWeek: {
              eventContent: (arg) => {
                return {
                  html: `
                    <div style="
                      padding: 4px;
                      color: #ffffff;
                      font-size: 14px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: calc(100% - 8px);
                      text-align: center;
                      line-height: 1.2;
                      margin: 4px 0;
                      border-radius: 4px;
                    ">
                      <div style="font-weight: 500;">
                        ${arg.event.extendedProps.start_time} - ${arg.event.extendedProps.end_time}
                      </div>
                      <div style="font-weight: 600; margin-top: 4px;">
                        ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(arg.event.extendedProps.price)}
                      </div>
                    </div>
                  `
                }
              }
            },
            timeGridDay: {
              eventContent: (arg) => {
                return {
                  html: `
                    <div style="
                      padding: 4px;
                      color: #ffffff;
                      font-size: 14px;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: calc(100% - 8px);
                      text-align: center;
                      line-height: 1.2;
                      margin: 4px 0;
                      border-radius: 4px;
                    ">
                      <div style="font-weight: 500;">
                        ${arg.event.extendedProps.start_time} - ${arg.event.extendedProps.end_time}
                      </div>
                      <div style="font-weight: 600; margin-top: 4px;">
                        ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(arg.event.extendedProps.price)}
                      </div>
                    </div>
                  `
                }
              }
            }
          }}
        />
      </Box>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="slot-details-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#1a1c23",
            border: "1px solid #3f3f46",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
            p: 4,
            borderRadius: "16px",
          }}
        >
          {selectedSlot && (
            <>
              <Typography
                variant="h6"
                component="h2"
                sx={{ color: "#ffffff", mb: 2, fontWeight: 600 }}
              >
                Slot Details
              </Typography>
              <Typography sx={{ color: "#ffffff" ,  mb: 1 }}>
               {pods?.pod_name || ""}
              </Typography>
              <Typography sx={{ color: "#ffffff", mb: 1  }}>
                Slot ID: {selectedSlot.extendedProps.slot_id}
              </Typography>
              <Typography sx={{ color: "#ffffff", mb: 1 }}>
                Start: {new Date(selectedSlot.start).toLocaleString()}
              </Typography>
              <Typography sx={{ color: "#ffffff", mb: 1 }}>
                End: {new Date(selectedSlot.end).toLocaleString()}
              </Typography>
              <Typography sx={{ color: "#ffffff", mb: 1 }}>
                Status:{" "}
                {selectedSlot.extendedProps.is_available
                  ? "Available"
                  : "Occupied"}
              </Typography>

              <Typography sx={{ color: "#ffffff", mb: 1 }}>
                Price:{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedSlot.extendedProps.price)}
              </Typography>
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={handleEdit}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Edit Price
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                >
                  Delete Slot
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#1a1c23",
            border: "1px solid #3f3f46",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="delete-modal-title"
            variant="h6"
            component="h2"
            sx={{ color: "#ffffff" }}
          >
            Confirm Delete
          </Typography>
          <Typography
            id="delete-modal-description"
            sx={{ mt: 2, color: "#ffffff" }}
          >
            Are you sure you want to delete this slot?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              sx={{ mr: 2, color: "#ffffff" }}
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#1a1c23",
            border: "1px solid #3f3f46",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="edit-modal-title"
            variant="h6"
            component="h2"
            sx={{ color: "#ffffff", mb: 2 }}
          >
            Edit Slot Price
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Price"
            value={editingPrice}
            onChange={(e) => setEditingPrice(e.target.value)}
            inputProps={{ min: 50000 }}
            helperText="Minimum price is 50,000 VND"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
              },
              "& .MuiInputLabel-root": {
                color: "#ffffff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3f3f46",
              },
              "& .MuiFormHelperText-root": {
                color: "#ffffff",
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={handleCloseEditModal}
              sx={{ color: "#ffffff" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePrice}
              variant="contained"
              color="primary"
            >
              Update
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ManageSlots;
