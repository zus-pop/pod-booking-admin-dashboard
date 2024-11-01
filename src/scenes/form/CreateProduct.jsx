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
  import { Formik } from "formik";
  import * as yup from "yup";
  import { useState, useEffect } from "react";
  import { CloudUpload } from "@mui/icons-material";
  import { styled } from "@mui/material/styles";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
  const API_URL = import.meta.env.VITE_API_URL;
  
  const initialValues = {
    product_name: "",
    description: "",
    image: null,
    category_id: "",
    price: "",
    store_id: "",
    stock: "",
  };
  
  const checkoutSchema = yup.object().shape({
    product_name: yup
      .string()
      .matches(/^[a-zA-Z0-9_ ]*$/, "Product Name không được chứa ký tự đặc biệt")
      .required("Product name is required"),
    description: yup.string().required("Description is required"),
    image: yup.mixed().required("image is required"),
    category_id: yup.number().required("Category is required"),
    price: yup.number().required("Price is required"),
    store_id: yup.number().required("Store is required"),
    stock: yup.number().required("Stock is required"),
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
  
  const CreateProduct = () => {
    const [filePreview, setFilePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
  
    useEffect(() => {
      fetchCategories();
      fetchStores();
    }, []);
  
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/categories`);
      
          setCategories(response.data);
   
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
  
    const fetchStores = async () => {
        try {
          const totalResponse = await axios.get(`${API_URL}/api/v1/stores`);
          if (totalResponse.status === 200 ) {
            const total = totalResponse.data.total;
      
            const response = await axios.get(`${API_URL}/api/v1/stores?limit=${total}`);
     
              setStores( response.data.stores);
              console.log( response.data.stores)
          }
        } catch (error) {
          console.error("Error fetching stores:", error);
        }
      };
  
    const handleFormSubmit = async (values, actions) => {
      try {
        const formData = new FormData();
        formData.append("product_name", values.product_name);
        formData.append("description", values.description);
        formData.append("image", values.image);
        formData.append("category_id", values.category_id);
        formData.append("price", values.price);
        formData.append("store_id", values.store_id);
        formData.append("stock", values.stock);
  
        const response = await fetch(`${API_URL}/api/v1/products`, {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          toast.success("Product created successfully");
          actions.resetForm();
          setFilePreview(null);
        } else {
          toast.error("Failed to create product");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while creating product");
      }
    };
  
    return (
      <Box m="20px">
        <Header title="CREATE PRODUCT" subtitle="Create a New Product"   showBackButton={true} />
     
  
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
              <Box display="flex" flexDirection="column" gap="30px">
                <TextField
                  fullWidth
                  variant="filled"
                  label="Product Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.product_name}
                  name="product_name"
                  error={touched.product_name && Boolean(errors.product_name)}
                  helperText={touched.product_name && errors.product_name}
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
                />
  
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    variant="filled"
                    value={values.category_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="category_id"
                    error={touched.category_id && Boolean(errors.category_id)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
  
                <TextField
                  fullWidth
                  variant="filled"
                  label="Price"
                  type="number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.price}
                  name="price"
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                />
  
                <TextField
                  fullWidth
                  variant="filled"
                  label="Stock"
                  type="number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.stock}
                  name="stock"
                  error={touched.stock && Boolean(errors.stock)}
                  helperText={touched.stock && errors.stock}
                />
  
                <FormControl fullWidth>
                  <InputLabel id="store-label">Store</InputLabel>
                  <Select
                    labelId="store-label"
                    variant="filled"
                    value={values.store_id}
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
                    <img width={300} height={200} alt="preview" src={filePreview} />
                  )}
                </Box>
                {touched.image && errors.image && <div>{errors.image}</div>}
              </Box>
  
              <Box display="flex" justifyContent="center" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Create New Product
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    );
  };
  
  export default CreateProduct;