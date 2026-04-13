import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { fetchCurrentUser } from "@/store/slices/userSlice";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .post(
        "https://expense-tracker-backend-43wk.onrender.com/auth/set-cookie",
        { token },
        { withCredentials: true }
      )
      .then(async () => {
        // 🔥 THIS IS THE MISSING PIECE
        await dispatch(fetchCurrentUser());

        navigate("/");
      });
  }, []);

  return <p>Logging you in...</p>;
}