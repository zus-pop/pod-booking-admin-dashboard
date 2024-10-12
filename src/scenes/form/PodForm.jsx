import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const initialValues = {
  pod_name: "",
  description: "",
  image: null,
  type_id: "",
  store_id: "",
  // utilities: [''],
};

const checkoutSchema = yup.object().shape({
  pod_name: yup.string().required("Pod name is required"),
  description: yup.string().required("Description is required"),
  image: yup.mixed().required("Image is required"),
  type_id: yup.number().required("Type ID is required"),
  store_id: yup.number().required("Store ID is required"),
  // utilities_id: yup.array().of.yup.number().required("Utilities is required")
});

const PodForm = () => {
  const [filePreview, setFilePreview] = useState(null);
  const [stores, setStores] = useState([]);
  const [types, setTypes] = useState([]);
  const [utilities,setUtilities] = useState([])
  
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/stores`);
        if (res.ok) {
          const data = await res.json();
          setStores(data);
        } else {
          console.log("Res is not ok");
        }
      } catch (err) {
        console.log(err);
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
        const res = await fetch(`${API_URL}/api/v1/pod-utilities`)
        if (res.ok) {
          const data = await res.json();
          setUtilities(data);

        } else {
          console.log("Res is not ok")
        }
      } catch (err) {
        console.log(err)
      }
      }
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
    formData.append("utility", JSON.stringify(values.utilities_id))

    formData.forEach((value, key) => {
      console.log(value);
      console.log(key);
    });
    try {
      const response = await fetch(`${API_URL}/api/v1/pods`, {
        method: "POST",
        body: formData,
        header: {
          "Content-type": "multipart/form-data",
        },
      });

      if (response.ok) {
        console.log("POD created successfully");
        actions.resetForm();
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
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
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

              {touched.image && errors.image && <div>{errors.image}</div>}
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
                  sx={{ gridColumn: "span 4" }}
                >
                  {types.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                <FormControl>
                  <InputLabel id="select-store-label">Store</InputLabel>
                  <Select
                    fullWidth
                    variant="filled"
                    labelID="select-store-label"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.store_id}
                    name="store_id"
                    error={touched.store_id && Boolean(errors.store_id)}
                    sx={{ gridColumn: "span 2" }}
                  >
                    {stores.map((store) => (
                      <MenuItem key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* { <FormControl>
                <InputLabel id="select-label">Utilities</InputLabel>
                <Select
                  fullWidth
                  variant="filled"
                  labelId="select-label"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.utilities_id}
                  name="utilies"
                  error={touched.type_id && Boolean(errors.type_id)}
                  sx={{ gridColumn: "span 4" }}
                >
                  {types.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> } */}
              <input
                type="file"
                onChange={(event) => {
                  const selectedFile = event.currentTarget.files[0];
                  setFilePreview(URL.createObjectURL(selectedFile));
                  setFieldValue("image", selectedFile);
                }}
                onBlur={handleBlur}
                name="image"
                accept="image/*"
                style={{
                  display: "block",
                  margin: "20px 0",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  cursor: "pointer",
                }}
              />
              {filePreview && (
                <Box
                  component="img"
                  sx={{
                    height: 233,
                    width: 350,
                    maxHeight: { xs: 233, md: 167 },
                    maxWidth: { xs: 350, md: 250 },
                  }}
                  alt="image"
                  src={filePreview}
                />
              )}
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
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
