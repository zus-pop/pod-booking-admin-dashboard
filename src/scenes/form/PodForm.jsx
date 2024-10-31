import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Header } from "../../components";
import { FieldArray, Formik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  pod_name: "",
  description: "",
  image: null,
  type_id: "",
  store_id: "",
  utilities: [],
};

const checkoutSchema = yup.object().shape({
  pod_name: yup
    .string()
    .matches(/^[a-zA-Z0-9_ ]*$/, "POD Name không được chứa ký tự đặc biệt")
    .required("Pod name is required"),
  description: yup.string().required("Description is required"),
  image: yup.mixed().required("Image is required"),
  type_id: yup.number().required("Type ID is required"),
  store_id: yup.number().required("Store ID is required"),
  utilities: yup.array().of(yup.number()),
});

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

const PodForm = () => {
  const [filePreview, setFilePreview] = useState(null);
  const [stores, setStores] = useState([]);
  const [types, setTypes] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const clearFilePreview = () => {
    setFilePreview(null);
  };
  useEffect(() => {
    const fetchStore = async () => {
        try {
          // Lấy tổng số stores
          const totalResponse = await axios.get(`${API_URL}/api/v1/stores`);
          if (totalResponse.status === 200) {
            const total = totalResponse.data.total;
      
            const response = await axios.get(`${API_URL}/api/v1/stores?limit=${total}`);
            if (response.status === 200) {
              setStores(response.data.stores);
            }
          }
        } catch (error) {
          console.error("Error fetching stores:", error);
        }
      };
    const fetchPodType = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/pod-types`);
        if (res.ok) {
          const data = await res.json();
          setTypes(data);
        } else {
          console.log("Res is not ok");
        }
      } catch (err) {
        console.log(err);
      }
    };
    const fetchUtilities = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/utilities`);
        if (res.ok) {
          const data = await res.json();
          setUtilities(data);
        } else {
          console.log("Res is not ok");
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUtilities();
    fetchStore();
    fetchPodType();
  }, []);

  const handleFormSubmit = async (values, actions) => {
    const formData = new FormData();
    formData.append("pod_name", values.pod_name);
    formData.append("description", values.description);
    formData.append("image", values.image);
    formData.append("type_id", values.type_id);
    formData.append("store_id", values.store_id);
    formData.append("utilities", JSON.stringify(values.utilities));

    formData.forEach((value, key) => {
      console.log(value);
      console.log(key);
    });
    try {
      const response = await fetch(`${API_URL}/api/v1/pods`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("POD created successfully");
        actions.resetForm();
        clearFilePreview();
      } else {
        console.error("Failed to create new POD");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE POD" subtitle="Create a New POD" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="flex"
              flexDirection="column"
              gap="30px"
              gridTemplateColumns="repeat(2, minmax(1, 5fr))"
            >
                 <FormControl>
                <InputLabel id="select-store-label">Store</InputLabel>
                <Select
                  variant="filled"
                  labelID="select-store-label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.store_id}
                  name="store_id"
                  error={touched.store_id && Boolean(errors.store_id)}
                  sx={{ gridColumn: "span 2" }}
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
              <TextField
                fullWidth
                variant="filled"
                label="Pod Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.pod_name}
                name="pod_name"
                error={touched.pod_name && Boolean(errors.pod_name)}
                helperText={touched.pod_name && errors.pod_name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                multiline
                variant="filled"
                label="Description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl>
                <InputLabel id="select-label">Type</InputLabel>
                <Select
                  fullWidth
                  variant="filled"
                  labelId="select-label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.type_id}
                  name="type_id"
                  error={touched.type_id && Boolean(errors.type_id)}
                >
                  {types.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
           
              <Box display="flex" justifyContent="space-around">
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ p: 2, width: "100%" }}
                >
                  Upload Image
                  <VisuallyHiddenInput
                    type="file"
                    hidden
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
                  <img width={300} height={200} alt="image" src={filePreview} />
                )}
              </Box>
              {touched.image && errors.image && <div>{errors.image}</div>}
              <FormControl fullWidth margin="normal">
                <InputLabel id="utilities-label">Utilities</InputLabel>
                <Select
                  labelId="utilities-label"
                  id="utilities"
                  multiple
                  value={values.utilities}
                  onChange={(event) => {
                    setFieldValue("utilities", event.target.value);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            utilities.find((u) => u.utility_id === value)
                              ?.utility_name
                          }
                        />
                      ))}
                    </Box>
                  )}
                >
                  {utilities.map((utility) => (
                    <MenuItem
                      key={utility.utility_id}
                      value={utility.utility_id}
                    >
                      {utility.utility_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              mt="30px"
            >
              <Button type="submit" color="secondary" variant="contained">
                Create New POD
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default PodForm;
