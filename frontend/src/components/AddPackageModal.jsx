import usePackageStore from "../store/usePackageStore";
import { useState } from "react";
import { Modal, TextInput, Group, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

const AddPackageModal = ({ opened, close }) => {
  const { createPackage } = usePackageStore();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    await createPackage(values);
    form.reset(); // Mantine magic: clears the form instantly
    close();
    setLoading(false);
  };
  return (
    <Modal opened={opened} onClose={close} title="Add New Package" centered>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="e.g. work"
          withAsterisk
          {...form.getInputProps("name")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AddPackageModal;
