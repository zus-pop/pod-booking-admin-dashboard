import { useState, useEffect } from 'react';
import { Box, Typography, Modal,Button } from '@mui/material';
import { Header } from "../../components";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useTheme } from '@mui/material';
import { tokens } from "../../theme";
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const ManageSlots = () => {
  const theme = useTheme();
  const navigate = useNavigate()
  const {pod_id} = useParams()
  const colors = tokens(theme.palette.mode);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);
  

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/slots`, {
        params: {
          pod_id: pod_id,
        }
      });
      setSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
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

    
    const slotsOnDay = slots.filter(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.toDateString() === clickedDate.toDateString();
    });
    

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

  return (
    <Box m="20px">
      <ToastContainer />
      <Header title="MANAGE SLOTS" subtitle="View and manage booking slots" />
      <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/web/pod/${pod_id}/slot`)}
          >
            Generate Slot
          </Button>
      <Box
        sx={{
          backgroundColor: '#1a1c23',
          borderRadius: "16px", 
          padding: "20px",
          "& .fc": {
            fontFamily: "'Inter', sans-serif",
          },
          "& .fc-toolbar-title": {
            color: "ffff",
            fontSize: '1.5rem',
            fontWeight: 600,
          },
          "& .fc-button": {
            backgroundColor: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            '&:hover': {
              backgroundColor: colors.greenAccent[600],
            },
            '&:disabled': {
              backgroundColor: colors.greenAccent[700],
            },
            textTransform: 'capitalize',
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
            '&:hover': {
              backgroundColor: colors.greenAccent[600],
              cursor: 'pointer',
            },
          },
          "& .fc-timegrid-slot": {
            height: "70px !important",
            borderColor: '#3f3f46',
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
          "& .fc-daygrid-day.fc-day-has-event .fc-daygrid-day-number": {
            background: colors.greenAccent[600],
            borderRadius: "50%",
            padding: "5px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.primary[500],
            fontWeight: "600",
            boxShadow: colors.greenAccent[600],
          },
          "& .fc-scrollgrid": {
            borderColor: '#3f3f46',
          },
          "& .fc-scrollgrid td, & .fc-scrollgrid th": {
            borderColor: '#3f3f46',
          },
          "& .fc-highlight": {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          events={slots.map(slot => ({
            id: slot.slot_id.toString(),
            title: '',
            start: slot.start_time,
            end: slot.end_time,
            display: 'background',
            backgroundColor: colors.greenAccent[500],
            classNames: ['day-has-slot'],
            extendedProps: {
              price: slot.price,
              pod_id: slot.pod_id,
              is_available: slot.is_available
            }
          }))}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          slotDuration="01:00:00"
          height="80vh"
          views={{
            timeGridWeek: {
              eventContent: (arg) => {
                return {
                  html: `<div style="color: #ffffff !important ; font-size: 20px; font-weight: 600;">
                    ${new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(arg.event.extendedProps.price)}
                  </div>`
                }
              }
            },
            timeGridDay: {
              eventContent: (arg) => {
                return {
                  html: `<div style="color: #ffffff !important; font-size: 16px; font-weight: 600;">
                    ${new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(arg.event.extendedProps.price)}
                  </div>`
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
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: '#1a1c23',
            border: '1px solid #3f3f46',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            p: 4,
            borderRadius: '16px',
          }}
        >
          {selectedSlot && (
            <>
              <Typography variant="h6" component="h2" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                Slot Details
              </Typography>
              <Typography sx={{ color: '#ffffff' }}>
                POD ID: {selectedSlot.extendedProps.pod_id}
              </Typography>
              <Typography sx={{ color: '#ffffff', mb: 1 }}>
                Start: {new Date(selectedSlot.start).toLocaleString()}
              </Typography>
              <Typography sx={{ color: '#ffffff', mb: 1 }}>
                End: {new Date(selectedSlot.end).toLocaleString()}
              </Typography>
              <Typography sx={{ color: '#ffffff', mb: 1 }}>
                Status: {selectedSlot.extendedProps.is_available ? 'Available' : 'Occupied'}
              </Typography>
              
              <Typography sx={{ color: '#ffffff', mb: 1 }}>
                Price: {selectedSlot.price}
              </Typography>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
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
            bgcolor: '#1a1c23',
            border: '1px solid #3f3f46',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="delete-modal-title" variant="h6" component="h2" sx={{ color: '#ffffff' }}>
            Confirm Delete
          </Typography>
          <Typography id="delete-modal-description" sx={{ mt: 2, color: '#ffffff' }}>
            Are you sure you want to delete this slot?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              sx={{ mr: 2, color: '#ffffff' }}
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} variant="contained" color="error">
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ManageSlots;
