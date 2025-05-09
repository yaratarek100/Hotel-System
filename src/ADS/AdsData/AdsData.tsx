import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import { MenuItem, Select, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ADS_URLS, ROOMS_URLS } from "../../Services/Urls";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { privateUserAxiosInstance } from "../../Services/Axiosinstance";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { SelectChangeEvent } from "@mui/material/Select";
import {  AdsFormProps,  AdsData} from '../../Interfaces/AdsInterface'
import i18n from "../../i18n";



const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: "5%",
  borderRadius: "17px",
  width: "50%",
};
const passInputStyle = { py: "1px", width: "100%", m: "0" };

export default function AdsFormModal({
  open,
  handleClose,
  selectedItem,
  getAllAds,
}: AdsFormProps) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdsData>({
    mode: "onChange",
  });

  const addNewAd = async (values: AdsData) => {
    try {
      await privateUserAxiosInstance.post(ADS_URLS.CREATE_NEW_ADS, values);
      toast.success("Ad added successfully");
      handleClose();
      getAllAds(5,1);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const editAd = async (values: AdsData) => {
    try {
      await privateUserAxiosInstance.put(
        ADS_URLS.EDIT_ADS(selectedItem!._id),
        values
      );
      toast.success("Ad updated successfully");
      handleClose();
      getAllAds(5,1);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const getAdDataById = async (_id: string) => {
   
    try {
      const response = await privateUserAxiosInstance.get(
        ADS_URLS.GET_ADS_DETAILS_BY_ID(_id!)
      );

      const data = response.data.data.ads;
      console.log(data);
      setSelectedRoomNumber(data?.room?.roomNumber);
      reset({
        discount: data.room.discount,
        isActive: data.isActive ? "true" : "false",
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to load ad data");
    }
  };
  const getAllRooms = async () => {
    try {
      const response = await privateUserAxiosInstance.get(ROOMS_URLS.GET_ROOMS,{params:{size:50}});
      setRooms(response.data.data.rooms);
      console.log(response.data.data.rooms);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to load rooms");
    }
  };

  useEffect(() => {
    if (selectedItem) {
      getAdDataById(selectedItem._id);
    } else {
      reset({
        discount: 0,
        isActive: "true",
      });
      getAllRooms();
    }
  }, [selectedItem]);



  const onSubmit = async (values: AdsData) => {
    const transformedValues = {
      ...values,
      isActive: values.isActive === "true",
    };
    if (selectedItem) {
      delete transformedValues.room;
      editAd(transformedValues);
    } else {
      addNewAd(transformedValues);
    }
  };

  const {t}= i18n

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: "1rem",
            alignItems: "center",
          }}
        >
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {selectedItem ? t("AdsData.EditAd") : t("AdsData.AddNew")}
          </Typography>
          <IconButton edge="end" onClick={() => handleClose()}>
            <CloseIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>

        {/* Inputs */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {selectedItem ? (
            <Typography sx={passInputStyle}>
             {t("AdsData.RoomNumber")}: {selectedRoomNumber}
            </Typography>
          ) : (
            <FormControl sx={{ display: "block", mt: "0.5rem" }}>
              <Select
                sx={passInputStyle}
                inputProps={{ "aria-label": "Without label" }}
                onChange={(event: SelectChangeEvent) => {
                  setValue("room", event.target.value);
                }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Room Number</em>
                </MenuItem>

                {rooms.map((room: any) => (
                  <MenuItem value={room._id}>{room.roomNumber}</MenuItem>
                ))}
              </Select>
              {errors.room && (
                <Typography color="error">
                  {errors.room.message?.toString()}
                </Typography>
              )}
            </FormControl>
          )}

          <FormControl sx={{ display: "block", mt: "0.5rem" }}>
            <TextField
              {...register("discount", {
                required: "discount is required",
              })}
              type="text"
              placeholder="Discount"
              sx={passInputStyle}
            />
            {errors.discount && (
              <Typography color="error">
                {errors.discount.message?.toString()}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ display: "block", mt: "0.5rem" }}>
            <Select
              value={selectedItem?.isActive === true ? "true" : "false"}
              onChange={(event: SelectChangeEvent) => {
                setValue("isActive", event.target.value === "true");
              }}
              sx={passInputStyle}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
            >
              <MenuItem value={"true"}>active</MenuItem>
              <MenuItem value={"false"}>inactive</MenuItem>
            </Select>
            {errors.isActive && (
              <Typography color="error">
                {errors.isActive.message?.toString()}
              </Typography>
            )}
          </FormControl>

          <Button
                        disabled={isSubmitting}
                        variant="outlined"
                        type="submit"
                        sx={{
                          color: "#203FC7", 
                          borderColor: "#203FC7", 
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '10px 30px',
                          borderRadius: '10px',
                          textTransform: 'capitalize',
                          width:"100%",
                          mt:2,
                          '&:hover': {
                            backgroundColor: "#203FC7", 
                            color: "#fff",
                            borderColor: "#203FC7",
                          },
                        }}
                      >
                        {isSubmitting ? t("AdsData.Saving") : t("AdsData.save")}
                      </Button>
        </form>
      </Box>
    </Modal>
  );
}
