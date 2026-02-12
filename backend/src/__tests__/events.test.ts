import { expect, test, describe, beforeAll } from "bun:test";
import * as repo from "../events/repository";
import type { EventInput } from "../types";

describe("Gestion events", () => {
  
  test("listEvents doit retourner liste des événements", async () => {
    const events = await repo.listEvents(true);
    expect(Array.isArray(events)).toBe(true);
  });

  test("createEvent doit insérer un événement et le retourner", async () => {
    const newEvent: EventInput = {
      title: "Sortie Club Photo Poisson",
      description: "Apprendre à photographier ses aquariums",
      date: new Date("2026-03-01T10:00:00Z").toISOString(),
      location: "Nancy Centre",
      max_participants: 10
    };

    const created = await repo.createEvent(newEvent);
    
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.title).toBe(newEvent.title);

    await repo.deleteEvent(created.id);
  });

  test("getEvent doit retourner undefined pour un ID inexistant", async () => {
    const event = await repo.getEvent(999999);
    expect(event).toBeUndefined();
  });

  test("deleteEvent doit retourner true si l'événement existait", async () => {
    const temp = await repo.createEvent({
      title: "A supprimer",
      date: new Date().toISOString()
    });

    const result = await repo.deleteEvent(temp.id);
    expect(result).toBe(true);

    const check = await repo.getEvent(temp.id);
    expect(check).toBeUndefined();
  });
});