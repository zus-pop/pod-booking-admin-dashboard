import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UpdatePOD = ({ open, handleClose, pod, onSubmit }) => {
  const [filePreview, setFilePreview] = useState(pod?.image || null);
  const fileInputRef = React.useRef(null);
  const [podTypes, setPodTypes] = useState([]);
  const [stores, setStores] = useState([]);

       
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  const [pageSize, setPageSize] = useState(4);

  const validationSchema = yup.object({
    pod_name: yup.string(),
    description: yup.string(),
    image: yup.mixed(),
    type_id: yup.number(),
    store_id: yup.number(),
  });
  useEffect(() => {
    const fetchPodTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/pod-types`);
        setPodTypes(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách loại POD:", error);
      }
    };
    const fetchStores = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/stores`);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cửa hàng:", error);
      }
    };
    const fetchStoreLimit = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/stores?limit=${total}`);
        setStores(response.data.stores);

      } catch (error) {
        console.error("Lỗi khi lấy danh sách cửa hàng:", error);
      }
    };
    fetchStoreLimit ();
    fetchStores();

    fetchPodTypes();
  }, []);
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Cập nhật POD
        </Typography>
        <Formik
          initialValues={{
            pod_name: pod?.pod_name || "",
            description: pod?.description || "",
            image: pod?.image || "",
            type_id: pod?.type_id || "",
            store_id: pod?.store_id || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append("pod_name", values.pod_name);
            formData.append("description", values.description);
            formData.append("type_id", values.type_id);
            formData.append("store_id", values.store_id);
            formData.append("image", values.image || pod.image);
            onSubmit(formData, setSubmitting);
          }}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="pod_name"
                label="Tên POD"
                value={values.pod_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.pod_name && Boolean(errors.pod_name)}
                helperText={touched.pod_name && errors.pod_name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Mô tả"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
              <Box display="flex" justifyContent="space-around">
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ p: 2, width: "100%" }}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    onChange={(event) => {
                      const selectedFile = event.currentTarget.files[0];
                      setFilePreview(URL.createObjectURL(selectedFile));
                      setFieldValue("image", selectedFile);
                    }}
                    onBlur={handleBlur}
                    name="image"
                    accept="image/*"
                  />
                </Button>
                {filePreview && (
                  <Box mt={2} position="relative">
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        borderRadius: 2,
                        border: "1px solid #ccc",
                      }}
                    >
                      <img
                        src={filePreview}
                        alt="image preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => {
                        setFilePreview(null);
                        setFieldValue("image", null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
              {touched.image && errors.image && <div>{errors.image}</div>}
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-select-label">Type POD</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type_id"
                  value={values.type_id}
                  label="Type POD"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="type_id"
                  error={touched.type_id && Boolean(errors.type_id)}
                >
                  {podTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="store-select-label">Store</InputLabel>
                <Select
                  labelId="store-select-label"
                  id="store_id"
                  value={values.store_id}
                  label="Store"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="store_id"
                  error={touched.store_id && Boolean(errors.store_id)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.store_id} value={store.store_id}>
                      {store.store_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Cập nhật
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default UpdatePOD;
